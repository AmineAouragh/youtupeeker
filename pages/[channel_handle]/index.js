import Image from "next/image"
import Head from 'next/head' 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { BiStats } from "react-icons/bi";
import { IoStatsChartOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa6";
import { BsPeopleFill } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";
import { GoHeartFill } from "react-icons/go";
import { FaComment } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
import { TiSocialYoutubeCircular } from "react-icons/ti"
import { GrCircleQuestion } from "react-icons/gr"
import { MdGrade } from "react-icons/md"
import { FaPeopleGroup } from "react-icons/fa6";
import { FaGrinStars } from "react-icons/fa";
import { FaGrinHearts } from "react-icons/fa";


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ChannelAnalyticsPage() {

  const router = useRouter()

  const { channel_handle } = router.query 
  const [ handle, setHandle ] = useState(null)
  const [ stats, setStats ] = useState(null)
  const [ channelTitle, setChannelTitle ] = useState('')
  const [ imageUrl, setImageUrl ] = useState('')
  const [ channelAge, setChannelAge ] = useState(0)
  const [ uploadsPlaylistId, setUploadsPlaylistId ] = useState('')
  const [ mostRecentUpload, setMostRecentUpload ] = useState('')
  const [ nbLikes, setNbLikes ] = useState(0)
  const [ nbComments, setNbComments ] = useState(0)
  const [ mostWatchedVideoId, setMostWatchedVideoId ] = useState('')
  const [ mostLikedVideoId, setMostLikedVideoId ] = useState('')
  const [ maxViews, setMaxViews ] = useState(0)
  const [ maxLikes, setMaxLikes ] = useState(0)
  const [ totalViews, setTotalViews ] = useState(0)
  const [ totalLikes, setTotalLikes ] = useState(0)


  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_DATA_API_KEY 


  function getChannelAge(publishedAt){
    const creationDate = new Date(publishedAt)
    const now = new Date()
    const diffInMs = now - creationDate 

    const seconds = Math.floor(diffInMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const months = Math.floor(days / 30.44)
    const years = Math.floor(months / 12)

    if (years > 0){
      return years === 1 ? "1 year" : `${years} years`
    } else if (months > 0){
      return months === 1 ? "1 month" : `${months} months`
    } else if (days > 0){
      return days === 1 ? "1 day" : `${days} days`
    } else if (hours > 0){
      return hours === 1 ? "1 hour" : `${hours} hours`
    } else {
      return "Less than 1 hour"
    }
  }

  async function fetchUploadedVideos(playlistId){

    let nextPageToken = null 

    let totalLikes = 0 
    let totalComments = 0 

    let firstBatch = true 

    let likesArr = []
    let viewsArr = []

    let ids = []
    
    do {

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&key=${API_KEY}&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`

      const response = await fetch(url)  // 1 quota for each batch of 50 videos fetched
      const data = await response.json() 

      const currentVideos = data.items

      if (firstBatch && currentVideos.length > 0) {
        const mostRecent = getChannelAge(currentVideos[0].contentDetails.videoPublishedAt);
        setMostRecentUpload(mostRecent);
        firstBatch = false
      }
 
      let videoIds = currentVideos.map(video => video.contentDetails.videoId)

      for (let i = 0; i < currentVideos.length; i++){
        ids.push(currentVideos[i].contentDetails.videoId)
      }

      function chunkArray(arr, size){
        const chunks = [] 
        for (let i = 0; i < arr.length-1; i += size){
          chunks.push(arr.slice(i, i+size))
        }
        return chunks
      }

      const videoIdChunks = chunkArray(videoIds, 50)


      for (const chunk of videoIdChunks) {
        const idsParam = chunk.join(',');
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics,contentDetails&id=${idsParam}`); // 1 quota for each batch of 50 videos
        const videoData = await res.json();
        console.log(videoData)
        videoData.items.forEach(stat => {
          likesArr.push(stat.statistics.likeCount)
          viewsArr.push(stat.statistics.viewCount)
          totalLikes += parseInt(stat.statistics.likeCount || 0)
          totalComments += parseInt(stat.statistics.commentCount || 0)
        })
      }

      nextPageToken = data.nextPageToken

    } while (nextPageToken)


      let max = 0 
      let max_like = 0

      let views = []
      let likes = []

      for (let i = 0; i < viewsArr.length; i++){
        views.push(parseInt(viewsArr[i]))
      }

      for (let i = 0; i < likesArr.length; i++){
        likes.push(parseInt(likesArr[i]))
      }

      for (let i = 0; i < views.length; i++){
        if (views[i] > max){
          max = views[i]
        }
      }

      for (let i = 0; i < likes.length; i++){
        if (likes[i] > max_like){
          max_like = likes[i]
        }
      }

      let maxViewsIndex = views.indexOf(max)
      let maxLikesIndex = likes.indexOf(max_like)

      setMaxViews(max)
      setMaxLikes(max_like)
      setMostWatchedVideoId(ids[maxViewsIndex])
      setMostLikedVideoId(ids[maxLikesIndex])

    setNbLikes(totalLikes) 
    setNbComments(totalComments)
 
  }

  async function fetchChannelStats(handle){
    let apiRequest = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails,topicDetails&key=${API_KEY}&forHandle=${handle}`
    const response = await fetch(apiRequest) // 1 quota
    const data = await response.json()
    console.log(data)
    setStats(data.items[0].statistics)
    setTotalViews(data.items[0].statistics.viewCount)
    setTotalLikes(data.items[0].statistics.likeCount)
    setChannelTitle(data.items[0].snippet.title)
    setImageUrl(data.items[0].snippet.thumbnails.high.url)
    const age = getChannelAge(data.items[0].snippet.publishedAt) 
    setChannelAge(age)
    setUploadsPlaylistId(data.items[0].contentDetails.relatedPlaylists.uploads)
    await fetchUploadedVideos(data.items[0].contentDetails.relatedPlaylists.uploads)
  }

  function formatNumber(num){
    const number = Number(num) 
    if (number > 1000000000){
      return (number / 1000000000).toFixed(1) + "B"
    } else if (number > 1000000){
      return (number / 1000000).toFixed(1) + "M"
    } else if (number > 1000) {
      return (number / 1000).toFixed(1) + "K"
    } else {
      return number.toLocaleString()
    }
  }

  useEffect(() => {
    console.log(channel_handle)
    if (channel_handle) {
        fetchChannelStats(channel_handle)
    }
  }, [channel_handle])

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Cairo:wght@200..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <title>{channel_handle} | Youtupeeker</title>
      </Head>
      <div className="flex flex-col justify-center items-center w-full h-full relative py-8 px-3">
        <Link href="/" className="flex flex-row items-center justify-start">
          <IoStatsChartOutline size={36} className="text-red-500 font-bold mr-3" />
          <span className="font-Inter text-3xl font-bold text-red-500 mt-2">Youtupeeker</span>
        </Link>
        <div className="mt-16 flex flex-col w-full md:w-3/4 md:px-3 items-start justify-center">
          { stats && 
           <div className="flex flex-row items-center mb-5 justify-between w-full">
             <div className=" flex flex-row items-center font-bold text-slate-700">
              <Image src={imageUrl} alt="" height={60} width={60} className="border-4 border-red-500 rounded-full mr-2 md:mr-4" />
              <div className="flex flex-col items-start">
                <span className="text-xl sm:text-2xl md:text-3xl text-red-500">{channelTitle}:</span>
                <span className="text-red-500 text-md">@{channel_handle}</span>
              </div>
             </div>
              <Link href={`https://youtube.com/${channel_handle}`} target="_blank">
                <button type="button" className="rounded-3xl px-3 py-2 md:px-6 md:py-4 text-lg md:text-2xl flex flex-row items-center bg-red-500 text-white font-bold font-Inter">
                  <TiSocialYoutubeCircular size={36} />
                  <span className="md:ml-2">Visit</span>
                </button>
              </Link>
           </div>
          }
          {
            stats && 
              <div className="flex flex-col items-start">
                <p className="text-xl font-semibold text-slate-600 font-Inter">{channelAge} on Youtube - Recent Upload: {mostRecentUpload} ago</p>
              </div>     
          }
          <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-5">
          {
            stats && 
              Object.entries(stats).map(([key, value], index) => (
                <div key={index} className={`${key == "hiddenSubscriberCount" && "hidden"} flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center`}>
                  {
                    key == "viewCount" && <FaEye size={26} className="text-red-500 mb-3" />
                  }
                  {
                    key == "subscriberCount" && <BsPeopleFill size={26} className="text-red-500 mb-3" />
                  }
                  {
                    key == "videoCount" && <FaVideo size={26} className="text-red-500 mb-3" />
                  }
                  {
                    key == "viewCount" && <span className="mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Views</span>
                  }
                  {
                    key == "subscriberCount" && <span className="mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Subscribers</span>
                  }
                  {
                    key == "videoCount" && <span className="mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Videos</span>
                  }
                  {
                    (key == "viewCount" || key == "subscriberCount" || key == "videoCount") 
                    && 
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <p className="font-Inter text-red-500 text-2xl md:text-3xl font-bold">{formatNumber(value)}</p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="p-2 opacity-90 bg-red-500">
                            <p className="font-Inter text-lg font-bold">{value}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  } 
                </div>
              ))
          }
          {
            stats && (
              <div className='relative flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                    <FaEye size={26} />
                    <MdOutlineArrowRight size={26} />
                    <BsPeopleFill size={26} />
                </div>
                <span className="relative mb-2 text-lg md:text-xl text-center text-red-500 font-bold font-Poppins">Conversion Rate</span>
                <p className="relative mb-2 font-Inter text-red-500 text-2xl md:text-3xl font-bold">{((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)}%</p>
                <span className="relative text-red-600 font-Inter bg-red-50 px-2 py-1 text-lg font-bold">
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 0 && (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) <= 0.25
                    && 
                    "Very Low"
                  }
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 0.25 && (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) <= 0.75
                    && 
                    "Low"
                  }
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 0.75 && (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) <= 2
                    && 
                    "Average"
                  }
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 2 && (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) <= 4
                    && 
                    "Good"
                  }
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 4 && (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) <= 6
                    && 
                    "Great"
                  }
                  {
                    (((Number(stats.subscriberCount) / Number(stats.viewCount)) * 100).toFixed(2)) > 6 
                    && 
                    "Excellent"
                  }
                </span>
                <div className="absolute top-2 hidden md:flex right-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                    <GrCircleQuestion size={22} className="text-red-300" />
                    </TooltipTrigger>
                    <TooltipContent className="w-1/2 p-4 opacity-90 bg-red-500">
                      <p className="font-Inter text-lg mb-2 font-bold">Measures the percentage of viewers who subscribe.</p>
                      <p className="font-Inter py-1 px-3 bg-white text-lg text-slate-700 rounded-lg mx-auto">subscribers / views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
              </div>
            )
          }
          {
            (stats && nbLikes > 0) && (
              <div className='flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center'>
                <div className="mb-3 text-red-500 flex flex-row items-center">
                    <GoHeartFill size={26} />
                </div>
                <span className="mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Likes</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="font-Inter text-red-500 text-2xl md:text-3xl font-bold">{formatNumber(nbLikes)}</p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-2 opacity-90 bg-red-500">
                      <p className="font-Inter text-lg font-bold">{nbLikes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )
          }
          {
            (stats && nbComments > 0) && (
              <div className='flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center'>
                <div className="mb-3 text-red-500 flex flex-row items-center">
                    <FaComment size={26} />
                </div>
                <span className="mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Comments</span>
                <p className="font-Inter text-red-500 text-2xl md:text-3xl font-bold">{formatNumber(nbComments)}</p>
              </div>
            )
          }
          {
            stats && (
              <div className='relative flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                    <FaFire size={26} />
                </div>
                <div className="relative flex flex-row items-center mb-2">
                  <span className="text-lg md:text-xl text-red-500 text-center font-bold font-Poppins">Engagement Rate</span>
                </div>
                <p className="relative mb-2 font-Inter text-red-500 text-2xl md:text-3xl font-bold">{(((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)}%</p>
                <span className="relative text-red-600 font-Inter bg-red-50 px-2 py-1 text-lg font-bold">
                  {
                    ((((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)) > 0 && (((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2) <= 0.5
                    && 
                    "Very Low"
                  }
                  {
                    ((((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)) > 0.5 && (((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2) <= 1.5
                    && 
                    "Low"
                  }
                  {
                    ((((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)) > 1.5 && (((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2) <= 3
                    && 
                    "Average"
                  }
                  {
                    ((((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)) > 3 && (((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2) <= 5
                    && 
                    "Good"
                  }
                </span>
                <div className="absolute top-2 right-2 hidden md:flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <GrCircleQuestion size={22} className="text-red-300" />
                    </TooltipTrigger>
                    <TooltipContent className="w-1/2 p-4 opacity-90 bg-red-500">
                      <p className="font-Inter text-lg mb-2 font-bold">Measures how actively viewers interact with your channel.</p>
                      <p className="font-Inter py-1 px-3 bg-white text-lg text-slate-700 rounded-lg mx-auto">(likes+comments) / views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
              </div>
            )
          }
          {
            (stats && nbComments > 0) && (
              <div className='relative flex flex-col bg-gradient-to-br from-red-200 via-white to-white border border-red-200 shadow-md rounded-2xl px-8 py-4 md:py-8 justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                    <FaFire size={26} />
                </div>
                <span className="relative mb-2 text-lg md:text-xl text-red-500 font-bold font-Poppins">Engagements</span>
                <p className="relative font-Inter text-red-500 text-2xl md:text-3xl font-bold">{formatNumber(nbLikes + nbComments)}</p>
                <div className="absolute top-0 right-0 px-2 py-1 rounded-tr-2xl rounded-bl-2xl bg-red-500">
                  <span className="text-white font-bold text-sm font-Inter">New</span>
                </div>
              </div>
            )
          }
          {
            (stats && mostWatchedVideoId.length > 0) && (
              <div className='hidden relative flex flex-col bg-gradient-to-b from-red-100 via-white to-white border border-red-200 shadow-sm rounded-2xl justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                  <FaGrinStars size={26} />
                </div>
                <div className="relative flex flex-row items-center mb-4">
                  <span className="text-lg md:text-2xl text-center text-red-500 font-bold font-Poppins">Most Watched</span>
                </div>
                <p className="relative font-Inter text-red-500 text-xl font-bold">{formatNumber(maxViews)} views</p>
                <div className="absolute top-2 right-2 rounded-2xl overflow-hidden">
                  <Link title="Watch Video on YouTube" target="_blank" href={`https://youtube.com/watch?v=${mostWatchedVideoId}`} className="text-red-300 flex flex-row items-center group">
                    <TiSocialYoutubeCircular size={30} className="text-red-400 group-hover:text-red-500 mr-1" />
                    <span className="hidden md:flex text-red-400 font-Inter group-hover:text-red-500 font-semibold">Watch</span>
                  </Link>
                </div>
                <div className="absolute top-0 left-0 px-2 py-1 rounded-tl-2xl rounded-br-2xl bg-red-500">
                  <span className="text-white font-bold text-sm font-Inter">New</span>
                </div>
              </div>
            )
          }
          {
            (stats && mostLikedVideoId.length > 0) && (
              <div className='hidden relative flex flex-col bg-gradient-to-b from-red-100 via-white to-white px-8 py-4 md:py-8 border border-red-200 shadow-sm rounded-2xl justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                  <FaGrinHearts size={26} />
                </div>
                <div className="relative flex flex-row items-center mb-4">
                  <span className="text-lg md:text-2xl text-red-500 text-center font-bold font-Poppins">Most Liked</span>
                </div>
                <p className="relative font-Inter text-red-500 text-xl font-bold">{formatNumber(maxLikes)} likes</p>
                <div className="absolute top-2 right-2 rounded-2xl overflow-hidden">
                  <Link title="Watch Video on YouTube" target="_blank" href={`https://youtube.com/watch?v=${mostLikedVideoId}`} className="flex group flex-row items-center text-red-300">
                    <TiSocialYoutubeCircular size={30} className="text-red-400 group-hover:text-red-500 mr-1" />
                    <span className="hidden md:flex text-red-400 font-Inter group-hover:text-red-500 font-semibold">Watch</span>
                  </Link>
                </div>
                <div className="absolute top-0 left-0 px-2 py-1 rounded-tl-2xl rounded-br-2xl bg-red-500">
                  <span className="text-white font-bold text-sm font-Inter">New</span>
                </div>
              </div>
            )
          }
          {
            stats && (
              <div className='hidden relative flex flex-col bg-gradient-to-b from-red-50 via-white to-white border border-red-200 shadow-sm rounded-2xl px-8 py-8 justify-center items-center'>
                <div className="relative mb-3 text-red-500 flex flex-row items-center">
                    <MdGrade size={26} />
                </div>
                <div className="relative flex flex-row items-center mb-4">
                  <span className="mr-2 text-xl md:text-3xl text-red-500 font-bold font-Poppins">Channel Score</span>
                </div>
                <p className="relative font-Inter text-red-500 text-xl font-bold">{(((nbLikes + nbComments) / Number(stats.viewCount)) * 100).toFixed(2)}%</p>
                <div className="absolute top-2 right-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <GrCircleQuestion size={22} className="text-red-300" />
                    </TooltipTrigger>
                    <TooltipContent className="w-1/2 p-4 opacity-90 bg-red-500">
                      <p className="font-Inter text-lg mb-2 font-bold">Measures how actively viewers interact with your channel.</p>
                      <p className="font-Inter py-1 px-3 bg-white text-lg text-slate-700 rounded-lg mx-auto">(likes+comments) / views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
              </div>
            )
          }
          {
            /*
              channel_score = views, subscribers, likes, videos, conversion rate, engagement rate
              1. engagement_rate * 0.30
              2. conversion_rate * 0.20 
              3. subscribers * 0.16
              4. likes * 0.12
              5. views * 0.12
              6. videos * 0.10
             */
          }
          </div>
          <div className="flex mt-8 flex-col sm:flex-row items-center justify-center w-full">
            <div className="w-full sm:w-1/2 mb-8 sm:mb-0 sm:mr-8 ">
            {
              (stats && mostWatchedVideoId.length > 0) && (
                <div className='relative flex pt-4 flex-col bg-gradient-to-br from-red-100 via-white to-white border border-red-200 shadow-md rounded-2xl justify-center items-center'> 
                  <div className="flex flex-col items-center w-full px-6 justify-between mb-3">
                    <div className="flex flex-row items-center mb-2">
                      <div className="relative mr-3 text-red-500 flex flex-row items-center">
                        <FaGrinStars size={22} />
                      </div>
                      <div className="relative flex mr-4 flex-row items-center">
                        <span className="text-lg md:text-xl text-center text-red-500 font-bold font-Poppins">Most Watched</span>
                      </div>
                    </div>
                    <div className="relative font-Inter text-red-500 flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">{formatNumber(maxViews)} views</p>
                      <p className="text-lg font-semibold">({Math.floor((maxViews/totalViews)*100)}% of all views)</p>
                    </div>
                  </div>
                  <iframe height={100} width={200} className="relative rounded-br-2xl rounded-bl-2xl w-full h-[280px]" src={`https://www.youtube.com/embed/${mostWatchedVideoId}`}></iframe>
                  <div className="absolute top-0 right-0 px-2 py-1 rounded-tr-2xl rounded-bl-2xl bg-red-500">
                    <span className="text-white font-bold text-sm font-Inter">New</span>
                  </div>
                </div>
              )
            }
            </div>
            <div className="w-full sm:w-1/2">
            {
              (stats && mostLikedVideoId.length > 0) && (
                <div className='relative flex pt-4 flex-col bg-gradient-to-br from-red-100 via-white to-white border border-red-200 shadow-md rounded-2xl justify-center items-center'> 
                  <div className="flex flex-col items-center w-full px-6 justify-between mb-3">
                    <div className="flex flex-row items-center mb-2">
                      <div className="relative mr-3 text-red-500 flex flex-row items-center">
                        <FaGrinHearts size={22} />
                      </div>
                      <div className="relative flex mr-4 flex-row items-center">
                        <span className="text-lg md:text-xl text-center text-red-500 font-bold font-Poppins">Most Liked</span>
                      </div>
                    </div>
                    <div className="flex flex-col relative font-Inter text-red-500 justify-center items-center">
                      <p className="text-2xl font-bold">{formatNumber(maxLikes)} likes</p>
                      <p className="text-lg font-semibold">({Math.floor((maxLikes/nbLikes)*100)}% of all likes)</p>
                    </div>
                  </div>
                  <iframe height={100} width={200} className="relative rounded-br-2xl rounded-bl-2xl w-full h-[280px]" src={`https://www.youtube.com/embed/${mostLikedVideoId}`}></iframe>
                  <div className="absolute top-0 right-0 px-2 py-1 rounded-tr-2xl rounded-bl-2xl bg-red-500">
                    <span className="text-white font-bold text-sm font-Inter">New</span>
                  </div>
                </div>
              )
            }
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}