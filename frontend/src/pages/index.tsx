import Head from 'next/head'
import { useState } from 'react'
import Chart from '../components/Chart'
import InputFields from '../components/Input'
import styles from '@/styles/Home.module.css'

export default function Home() {

  const [chartData, setChartData] = useState([])

  // TODO: this is a hacky way to pass data from child to parent
  //       find a better way to do this such as using a context
  //      or redux
  const handleSimulationResponse = (response: any) => {
    setChartData(response)
    console.log(chartData)
  }

  return (
    <>
      <Head>
        <title>Monte Carlo Food Bank Simulator</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <InputFields handleSimulationResponse={handleSimulationResponse} />
        <Chart dataList={Object.entries(chartData)} />
      </main>
    </>
  )
}
