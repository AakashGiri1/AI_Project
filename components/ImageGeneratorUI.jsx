'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "./ui/Button"
import { Textarea } from "./ui/Textarea"
import { CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Share2, Download, Clock, Bot, Menu, X, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResizableBox } from 'react-resizable'
import Image from 'next/image';

const LightEffect = () => (
  <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" />
)

export default function FuturisticImageGeneratorUI() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [promptHistory, setPromptHistory] = useState([])
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [error, setError] = useState("")
  const [cardSize, setCardSize] = useState({ width: 800, height: 500 }) // Reduced initial height
  const [viewImage, setViewImage] = useState(null)
  const [predictionId, setPredictionId] = useState(null)

  useEffect(() => {
    let interval
    if (predictionId) {
      interval = setInterval(async () => {
        const response = await fetch(`/api/predictions/${predictionId}`)
        const prediction = await response.json()
        if (prediction.status === 'succeeded') {
          setIsGenerating(false)
          setProgress(100)
          // Append new images to existing ones
          setGeneratedImages(prevImages => [...prevImages, ...prediction.output].slice(-4))
          setPromptHistory(prev => [{
            prompt,
            negativePrompt,
            timestamp: new Date().toLocaleTimeString(),
            images: prediction.output
          }, ...prev.slice(0, 5)])
          clearInterval(interval)
        } else if (prediction.status === 'failed') {
          setIsGenerating(false)
          setError('Image generation failed. Please try again.')
          clearInterval(interval)
        } else {
          // Update progress for 'starting' and 'processing' states
          setProgress((prev) => Math.min(prev + 10, 90))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [predictionId, prompt, negativePrompt])

  const handleRun = async () => {
    if (prompt.trim() === "") {
      setError("Please enter a prompt before generating.")
      return
    }
    setError("")
    setProgress(0)
    setIsGenerating(true)
    // Don't clear existing images
    // setGeneratedImages([])

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, negative_prompt: negativePrompt }),
      })
      const prediction = await response.json()
      setPredictionId(prediction.id)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to start image generation. Please try again.')
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setPrompt("")
    setNegativePrompt("")
    setProgress(0)
    setIsGenerating(false)
    setError("")
    // Don't clear generated images on reset
    // setGeneratedImages([])
    // Clear the predictionId to prevent unintended API calls
    setPredictionId(null)
  }

  const handleShare = async (imageUrl) => {
    const shareData = {
      title: 'Generated Image',
      text: 'Check out this AI-generated image!',
      url: imageUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        console.log('Shared successfully')
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(imageUrl)
        alert('Image URL copied to clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
        alert('Unable to share. Please copy the URL manually.')
      }
    }
  }

  const handleDownload = (imageUrl) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `generated-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (imageUrl) => {
    setViewImage(imageUrl)
  }

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible)
  }

  const onResize = (event, { size }) => {
    setCardSize({ width: size.width, height: size.height })
  }

  return (
    <div className="flex min-h-screen bg-[#0D0D0F] text-gray-300 overflow-hidden relative font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Space Grotesk', sans-serif;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #3a3a3a;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #4a4a4a;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .card-3d {
          transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
          transition: all 0.3s ease;
        }

        .card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          box-shadow: 0 25px 50px -12px rgba(255, 105, 180, 0.25);
        }

        .react-resizable-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiNmZmZmZmYiLz48L2c+PC9zdmc+');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
      `}</style>
      <LightEffect />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 text-transparent bg-clip-text flex items-center">
            <Bot className="w-6 h-6 md:w-8 md:h-8 mr-3 text-pink-500" />
            Eve AI Image Generator
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHistory}
            className="text-pink-400 hover:bg-pink-400 hover:bg-opacity-20 z-20"
            aria-label="Toggle Prompt History"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center">
          <ResizableBox
            width={cardSize.width}
            height={cardSize.height}
            onResize={onResize}
            minConstraints={[400, 300]}
            maxConstraints={[1200, 800]}
          >
            <motion.div 
              className="card-3d bg-[#1A1A1C] rounded-lg overflow-hidden w-full h-full"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative z-10 bg-opacity-95 h-full overflow-y-auto flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold text-pink-400">Image Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 flex-grow overflow-y-auto">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-pink-500">Progress</span>
                      <span className="text-sm text-gray-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-[#2A2A2C] rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium mb-1 text-pink-400">Input prompt</label>
                      <Textarea 
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className="w-full bg-[#2A2A2C] border-[#3A3A3C] text-gray-300 placeholder-gray-500 text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label htmlFor="negativePrompt" className="block text-sm font-medium mb-1 text-pink-400">Negative prompt</label>
                      <Textarea 
                        id="negativePrompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Describe what you don't want in the image..."
                        className="w-full bg-[#2A2A2C] border-[#3A3A3C] text-gray-300 placeholder-gray-500 text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-[#2A2A2C] rounded-lg aspect-square flex items-center justify-center overflow-hidden relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {image ? (
                          <>
                            <img src={image} alt={`Generated Image ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 flex justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(image)}
                                className="text-white hover:text-pink-300"
                                aria-label="View Image"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(image)}
                                className="text-white hover:text-pink-300"
                                aria-label="Share Image"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(image)}
                                className="text-white hover:text-pink-300"
                                aria-label="Download Image"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">Image will appear here</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 mt-auto">
                  <Button 
                    variant="outline" 
                    className="bg-[#2A2A2C] text-pink-400 border-[#3A3A3C] hover:bg-[#3A3A3C] hover:text-pink-300 text-sm"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 text-sm"
                    onClick={handleRun}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </CardFooter>
              </div>
            </motion.div>
          </ResizableBox>
        </div>
      </div>

      {/* Prompt History Sidebar */}
      <AnimatePresence>
        {isHistoryVisible && (
          <motion.div 
            className="fixed top-0 right-0 bottom-0 w-80 bg-[#1A1A1C] p-6 overflow-y-auto border-l border-[#2A2A2C] shadow-lg z-30"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-pink-400 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Prompt History
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHistory}
                className="text-pink-400 hover:bg-pink-400 hover:bg-opacity-20"
                aria-label="Close Prompt History"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {promptHistory.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="bg-[#2A2A2C] rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="relative">
                    <img src={item.images[0]} alt={`History ${index + 1}`} className="w-full h-32 object-cover rounded mb-3" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(item.images[0])}
                        className="text-white hover:text-pink-300"
                        aria-label="View Image"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(item.images[0])}
                        className="text-white hover:text-pink-300"
                        aria-label="Share Image"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item.images[0])}
                        className="text-white hover:text-pink-300"
                        aria-label="Download Image"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-pink-300 text-xs mb-2">{item.timestamp}</p>
                  <p className="text-gray-300 text-sm mb-2">{item.prompt}</p>
                  {item.negativePrompt && (
                    <p className="text-gray-400 text-xs italic">Negative: {item.negativePrompt}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewImage(null)}
          >
            <motion.div
              className="bg-[#1A1A1C] p-4 rounded-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={viewImage} layout="intrinsic" width={1024} height={768} onError={() => setError("Failed to load image.")} alt="Viewed Image" className="w-full h-auto max-w-[1024px] max-h-[768px] object-contain" />
              <Button
                className="mt-4 bg-pink-500 text-white hover:bg-pink-600"
                onClick={() => setViewImage(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}