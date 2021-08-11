import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import axios from 'axios'

import styles from '../styles/Home.module.scss'

interface IColorEntity {
  color: string
  isDark: boolean
}

const getImageThemeColor = async (image: File) => {
  const formData = new FormData()
  formData.append('image', image)
  const response = await axios.post('/api/getThemeColor', formData)
  return response.data?.data as IColorEntity
}

const Home = () => {
  const [imgUrl, setImgUrl] = useState('')
  const [themeColor, setThemeColor] = useState('')
  const [isDark, setIsDark] = useState(true)

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files?.[0]) {
      let imgFile = e.target.files[0]

      console.log(imgFile, URL.createObjectURL(imgFile))

      const data = await getImageThemeColor(imgFile)
      setThemeColor(data.color)
      setIsDark(data.isDark)
      setImgUrl(URL.createObjectURL(imgFile))
    }
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: isDark ? '#EEEEEE' : '#333333',
        color: isDark ? '#333333' : '#EEEEEE',
      }}
    >
      <Head>
        <title>DogRod's Image Theme Color Meter</title>
        <meta name="description" content="DogRod's Image Theme Color Meter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <div>
            <img src={imgUrl} className={styles.image} />
          </div>
          <input type="file" name="myImage" onChange={onImageChange} />
        </div>
        <div
          style={{ display: themeColor ? 'flex' : 'none' }}
          className={styles.result}
        >
          <h3>Theme Color Of This Image</h3>
          <div
            className={styles.colorBlock}
            style={{ backgroundColor: themeColor }}
          />
          <div className={styles.colorDescription}>
            This color is <strong>{isDark ? 'dark' : 'light'}er</strong> than
            other colors
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
