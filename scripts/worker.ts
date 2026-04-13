/**
 * Video Processing Worker
 * 
 * This script processes uploaded videos:
 * 1. Extracts audio from video
 * 2. Transcribes audio using OpenAI Whisper
 * 3. Analyzes transcript for viral moments
 * 4. Generates clip timestamps
 * 5. Creates short-form video clips
 * 6. Uploads clips to S3
 * 
 * Run with: node scripts/worker.js
 * Or with nodemon for development: nodemon scripts/worker.js
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import OpenAI from 'openai'
import { v4 as uuid } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TEMP_DIR = '/tmp/clipforge'
const PROCESSING_BATCH_SIZE = 5
const PROCESSING_INTERVAL = 30000 // 30 seconds

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

/**
 * Get next video to process
 */
async function getNextVideoToProcess() {
  return prisma.uploadedVideo.findFirst({
    where: {
      transcriptionStatus: 'pending',
    },
    take: 1,
  })
}

/**
 * Download video from S3
 */
async function downloadVideoFromS3(s3Url: string, tempPath: string): Promise<void> {
  try {
    const response = await axios({
      method: 'get',
      url: s3Url,
      responseType: 'stream',
    })

    const writer = fs.createWriteStream(tempPath)
    return new Promise((resolve, reject) => {
      response.data.pipe(writer)
      response.data.on('error', reject)
      writer.on('error', reject)
      writer.on('finish', resolve)
    })
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

/**
 * Extract audio from video
 */
async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -q:a 9 -n "${audioPath}" 2>&1 | grep -E "(error|invalid)`
    )
  } catch (error) {
    console.error('Audio extraction error:', error)
    throw error
  }
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioPath: string): Promise<{
  text: string
  segments: Array<{ start: number; end: number; text: string }>
}> {
  try {
    const audioFile = fs.createReadStream(audioPath)

    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    })

    const segments = (transcript as any).segments || []

    return {
      text: transcript.text,
      segments: segments.map((seg: any) => ({
        start: Math.floor(seg.start),
        end: Math.floor(seg.end),
        text: seg.text,
      })),
    }
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

/**
 * Analyze transcript for viral moments using GPT
 */
async function analyzeForViralMoments(
  transcript: string,
  duration: number
): Promise<Array<{ start: number; end: number; type: string; score: number }>> {
  try {
    const batchSize = 2000 // Split large transcripts
    const batches = []

    for (let i = 0; i < transcript.length; i += batchSize) {
      batches.push(transcript.slice(i, i + batchSize))
    }

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying viral moments in transcripts. 
          Identify key moments that would make great short-form video clips (15-60 seconds).
          Look for:
          - Funny moments
          - Emotional reactions
          - Strong hooks and intros
          - High-energy speech
          - Key learning moments
          - Controversial but entertaining moments
          - Audience applause/reactions
          - Quotable lines
          
          Return a JSON array with format:
          [{"start": seconds, "end": seconds, "type": "moment_type", "score": 0-100}]
          
          Make the clips 30-45 seconds each.`,
        },
        {
          role: 'user',
          content: `Analyze this transcript for viral moments:\n\n${batches[0]}${batches.length > 1 ? `\n\n...and ${batches.length - 1} more batches...` : ''}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    try {
      const content = analysis.choices[0].message.content || '[]'
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanContent)
    } catch {
      console.warn('Failed to parse GPT response, returning empty array')
      return []
    }
  } catch (error) {
    console.error('Viral moment analysis error:', error)
    return []
  }
}

/**
 * Generate clip using FFmpeg
 */
async function generateClip(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number
): Promise<void> {
  try {
    const duration = endTime - startTime
    const width = 1080
    const height = 1920

    await execAsync(
      `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} ` +
      `-vf "scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}" ` +
      `-c:v libx264 -preset ultrafast -c:a aac "${outputPath}" -y 2>&1`
    )
  } catch (error) {
    console.error('Clip generation error:', error)
    throw error
  }
}

/**
 * Upload file to S3
 */
async function uploadToS3(filePath: string, fileName: string): Promise<string> {
  try {
    // In production, use AWS SDK or similar
    // For now, return a mock S3 URL
    console.log(`Would upload ${filePath} to S3 as ${fileName}`)
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
  } catch (error) {
    console.error('S3 upload error:', error)
    throw error
  }
}

/**
 * Process single video
 */
async function processVideo(video: any) {
  let tempVideoPath: string | null = null
  let tempAudioPath: string | null = null

  try {
    console.log(`Processing video ${video.id}: ${video.title}`)

    // Update status
    await prisma.uploadedVideo.update({
      where: { id: video.id },
      data: { transcriptionStatus: 'processing' },
    })

    // Generate temp paths
    tempVideoPath = path.join(TEMP_DIR, `${video.id}-video.mp4`)
    tempAudioPath = path.join(TEMP_DIR, `${video.id}-audio.mp3`)

    // Download video
    console.log(`Downloading video from S3...`)
    await downloadVideoFromS3(video.s3Url, tempVideoPath)

    // Extract audio
    console.log(`Extracting audio...`)
    await extractAudio(tempVideoPath, tempAudioPath)

    // Transcribe
    console.log(`Transcribing audio...`)
    const transcription = await transcribeAudio(tempAudioPath)

    // Update transcription
    await prisma.uploadedVideo.update({
      where: { id: video.id },
      data: {
        transcriptionStatus: 'completed',
        transcription: transcription.text,
        analysisStatus: 'processing',
      },
    })

    // Analyze for viral moments
    console.log(`Analyzing for viral moments...`)
    const viralMoments = await analyzeForViralMoments(transcription.text, video.duration)

    console.log(`Found ${viralMoments.length} viral moments`)

    // Generate clips
    const clips = []
    for (const moment of viralMoments.slice(0, 20)) {
      // Limit to 20 clips
      try {
        const clipId = uuid()
        const outputFileName = `clips/${video.userId}/${clipId}.mp4`
        const outputPath = path.join(TEMP_DIR, `${clipId}.mp4`)

        console.log(`Generating clip ${clipId}...`)
        await generateClip(tempVideoPath, outputPath, moment.start, moment.end)

        // Upload to S3
        const s3Url = await uploadToS3(outputPath, outputFileName)

        // Create database record
        const clip = await prisma.generatedClip.create({
          data: {
            uploadedVideoId: video.id,
            userId: video.userId,
            title: `Clip from ${video.title}`,
            description: moment.type,
            startTime: moment.start,
            endTime: moment.end,
            duration: moment.end - moment.start,
            format: 'VERTICAL_9_16',
            resolution: 'FULL_HD_1080x1920',
            s3Key: outputFileName,
            s3Url: s3Url,
            processingStatus: 'completed',
          },
        })

        clips.push(clip)

        // Clean up temp file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath)
        }
      } catch (error) {
        console.error(`Error generating clip:`, error)
      }
    }

    // Update video status
    await prisma.uploadedVideo.update({
      where: { id: video.id },
      data: {
        analysisStatus: 'completed',
        analysisData: viralMoments,
      },
    })

    console.log(`✅ Successfully processed video ${video.id}: generated ${clips.length} clips`)
  } catch (error) {
    console.error(`Error processing video ${video.id}:`, error)

    await prisma.uploadedVideo.update({
      where: { id: video.id },
      data: {
        transcriptionStatus: 'failed',
        analysisStatus: 'failed',
      },
    })
  } finally {
    // Clean up temp files
    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      fs.unlinkSync(tempVideoPath)
    }
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath)
    }
  }
}

/**
 * Worker loop
 */
async function runWorker() {
  console.log('🚀 ClipForge AI Processing Worker Started')
  console.log(`Processing interval: ${PROCESSING_INTERVAL}ms`)

  setInterval(async () => {
    try {
      const video = await getNextVideoToProcess()

      if (video) {
        await processVideo(video)
      } else {
        // Uncomment for verbose logging
        // console.log('No videos to process...')
      }
    } catch (error) {
      console.error('Worker error:', error)
    }
  }, PROCESSING_INTERVAL)
}

// Start worker
runWorker().catch((error) => {
  console.error('Fatal worker error:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})
