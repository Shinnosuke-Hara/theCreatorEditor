import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loading } from '../common/Loading'
import styles from './UploadFile.module.scss'

export const UploadThumbnail = () => {
  const [thumbnailUrl, seThumbnailUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLoading(true)
    const createObjectURL = window.webkitURL.createObjectURL
    if (acceptedFiles.length !== 0) {
      seThumbnailUrl(createObjectURL(acceptedFiles[0]))
    }
    setLoading(false)
  }, [])
  const { fileRejections, acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
    accept: {
      'image/*': [],
    },
  })
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <>
      <div>
        {errors.map((e) => (
          <p key={e.code}>{file.name}は許可された拡張子ではありません</p>
        ))}
      </div>
    </>
  ))
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoading(true)
      if (e.target.files !== null) {
        const file = e.target.files[0]
        const createObjectURL = window.webkitURL.createObjectURL
        acceptedFiles.push(file)
        seThumbnailUrl(createObjectURL(acceptedFiles[0]))
      }
      setLoading(false)
    },
    [acceptedFiles],
  )

  const handleDelete = useCallback(() => {
    setLoading(true)
    acceptedFiles.pop()
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }, [acceptedFiles])

  return (
    <div>
      <div {...getRootProps()} className={styles.container}>
        {acceptedFiles.length > 0 ? (
          acceptedFiles.map((acceptedFile) => (
            <div className={styles.image__wrapper} key={acceptedFile.name}>
              <div className={styles.image}>
                <img src={thumbnailUrl} alt='' width='100%' />
              </div>
              <div className={styles.delete} onClick={handleDelete}>
                削除
              </div>
            </div>
          ))
        ) : (
          <div className={styles.wrapper}>
            {!loading ? (
              <div className={styles.loading}>
                <Loading />
                <div className={styles.text}>ファイルを削除しています</div>
              </div>
            ) : (
              <>
                <label className={styles.input__wrapper}>
                  <input type='file' accept='image/*' className={styles.input} onChange={onChange} />
                  画像ファイルを選択
                </label>
                <div className={styles.text}>または</div>
                <div className={styles.text}>ここに画像ファイルをドロップしてください</div>
                <input {...getInputProps()} />
              </>
            )}
            <div className={styles.text}>{fileRejectionItems}</div>
          </div>
        )}
      </div>
    </div>
  )
}
