import Image from "next/image"
import Head from 'next/head' 
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { BiStats } from "react-icons/bi";
import { IoStatsChartOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa6";
import { BsPeopleFill } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";
import { GoHeartFill } from "react-icons/go";
import { FaComment } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";


export default function Home() {

  const [ handle, setHandle ] = useState('')

  const router = useRouter()

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Cairo:wght@200..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <title>Youtupeeker - YouTube Analytics Tool</title>
      </Head>
      <div className="flex flex-col justify-center items-center w-full h-screen px-3 py-8">
        <Link href="/" className="flex flex-row items-center">
          <IoStatsChartOutline size={24} className="text-red-500 font-bold" />
          <span className="text-red-500 ml-2 mt-2 text-xl font-Poppins font-semibold">Youtupeeker</span>
        </Link>
        <h1 className="font-Poppins text-3xl md:text-5xl text-center font-bold text-red-500 my-8">Instant YouTube Analytics</h1>
        <p className="font-Inter text-xl text-center mb-8 text-slate-600 font-semibold">Pull in key analytics of any channel instantly — all in one clean view.</p>
        <div className="relative flex flex-row w-full md:w-3/4 lg:w-2/3 xl:w-1/3">
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} id="channel_id_handle" name="channel_id_handle" className="w-full font-bold text-red-600 relative outline-none px-6 py-4 rounded-full border-2 border-red-500 text-xl font-Inter" placeholder="Type channel handle..." />
          <button type="button" onClick={() => router.push(`/${handle}`)} className="flex flex-row items-center absolute right-0 top-0 h-full rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl font-Inter font-bold px-6 py-2">
            <span className="mr-2 font-Poppins">Analyze</span>
            <BiStats size={28} className="scale-y-[-1]" />
          </button>
        </div>
        <div className="mt-8 flex flex-row items-center">
          <button type="button" onClick={() => fetchChannelStats("MrBeast")} className="rounded-full mr-2 font-Inter bg-gray-100 text-gray-700 font-semibold px-3 py-1">MrBeast</button>
          <button type="button" onClick={() => fetchChannelStats("theRadBrad")} className="rounded-full mr-2 font-Inter bg-gray-100 text-gray-700 font-semibold px-3 py-1">theRadBrad</button>
          <button type="button" onClick={() => fetchChannelStats("freecodecamp")} className="rounded-full font-Inter bg-gray-100 text-gray-700 font-semibold px-3 py-1">freecodecamp</button>
        </div>
      </div>
    </>
  );
}
