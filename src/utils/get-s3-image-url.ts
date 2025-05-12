export const getS3ImageUrl = (path?: string, bucket?: string) => {
  if (!path || !bucket) {
    return null
  }

  const baseUrl = `https://${bucket}.s3.amazonaws.com`
  return `${baseUrl}/${path}`
}
