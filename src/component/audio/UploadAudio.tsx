import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loading } from '../common/Loading'
import styles from '../common/UploadFile.module.scss'

export const Audio = () => {
  const [mp3Url, setMp3Url] = useState('')
  const [loading, setLoading] = useState(false)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLoading(true)
    const createObjectURL = window.webkitURL.createObjectURL
    if (acceptedFiles.length !== 0) {
      setMp3Url(createObjectURL(acceptedFiles[0]))
    }
    setLoading(false)
  }, [])
  const { fileRejections, acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
    accept: {
      'audio/*': [],
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
        setMp3Url(createObjectURL(acceptedFiles[0]))
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
    <div className={styles.container}>
      <div
        {...getRootProps()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: 200,
          borderWidth: 2,
          borderRadius: 2,
          borderColor: '#000',
          borderStyle: 'dashed',
          backgroundColor: '#fafafa',
          color: '#000000',
        }}
      >
        <div className={styles.wrapper}>
          {acceptedFiles.length > 0 ? (
            acceptedFiles.map((acceptedFile) => (
              <div className={styles.mp3__wrapper} key={acceptedFile.name}>
                <audio controls src={mp3Url} />
                <div className={styles.delete} onClick={handleDelete}>
                  削除
                </div>
              </div>
            ))
          ) : (
            <div>
              {loading ? (
                <div className={styles.loading}>
                  <Loading />
                  <div className={styles.text}>ファイルを削除しています</div>
                </div>
              ) : (
                <>
                  <label className={styles.input__wrapper}>
                    <input type='file' accept='audio/*' className={styles.input} onChange={onChange} />
                    音声ファイルを選択
                  </label>
                  <div className={styles.text}>または</div>
                  <div className={styles.text}>ここに音声ファイルをドロップしてください</div>
                  <input {...getInputProps()} />
                </>
              )}
              <div className={styles.text}>{fileRejectionItems}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
