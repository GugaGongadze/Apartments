import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Avatar } from '@material-ui/core'

interface ImageUploadProps {
  avatar: string | null
  onImageUpload: (file: File) => void
}

function ImageUploader(props: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: 'image/*',
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0]
      setFile(newFile)

      props.onImageUpload(newFile)
    },
  })

  const filePreview = file && URL.createObjectURL(file)
  const placeholderImage =
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'

  return (
    <section className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <Avatar
          onClick={open}
          style={{ width: 200, height: 200, cursor: 'pointer' }}
          src={filePreview || props.avatar || placeholderImage}
        />
        <input {...getInputProps()} />
      </div>
    </section>
  )
}

export default ImageUploader
