import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || '/usr/bin/ffmpeg')
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH || '/usr/bin/ffprobe')

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  fps: number
  codec: string
}

export async function extractVideoMetadata(
  buffer: Buffer
): Promise<Partial<VideoMetadata>> {
  return new Promise((resolve, reject) => {
    const tempFile = path.join('/tmp', `temp-${Date.now()}.mp4`)

    // Write buffer to temp file
    fs.writeFileSync(tempFile, buffer)

    ffmpeg(tempFile).ffprobe((err, metadata) => {
      fs.unlinkSync(tempFile)

      if (err) {
        reject(err)
        return
      }

      const stream = metadata.streams.find((s: any) => s.codec_type === 'video')

      resolve({
        duration: metadata.format.duration || 0,
        width: stream?.width || 1920,
        height: stream?.height || 1080,
        fps: stream?.r_frame_rate
          ? parseInt(stream.r_frame_rate.split('/')[0]) / parseInt(stream.r_frame_rate.split('/')[1])
          : 30,
        codec: stream?.codec_name || 'h264',
      })
    })
  })
}

export async function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioFrequency(16000)
      .audioChannels(1)
      .on('error', reject)
      .on('end', resolve)
      .run()
  })
}

export async function generateClip(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number,
  options: {
    width?: number
    height?: number
    fps?: number
  } = {}
): Promise<void> {
  const width = options.width || 1080
  const height = options.height || 1920

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(startTime)
      .duration(endTime - startTime)
      .output(outputPath)
      .size(`${width}x${height}`)
      .fps(options.fps || 30)
      .videoCodec('libx264')
      .audioCodec('aac')
      .preset('ultrafast')
      .on('error', reject)
      .on('end', resolve)
      .run()
  })
}

export async function addCaptions(
  inputPath: string,
  outputPath: string,
  subtitlePath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .input(subtitlePath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-vf',
        `subtitles=${subtitlePath}:force_style='FontSize=24,FontColor=&HFFFFFF&'`,
      ])
      .on('error', reject)
      .on('end', resolve)
      .run()
  })
}

export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timemarkSeconds: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshot({
        timestamps: [timemarkSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x180',
      })
      .on('error', reject)
      .on('end', resolve)
  })
}
