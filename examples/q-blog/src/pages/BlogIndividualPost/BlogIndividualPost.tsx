import React from 'react'
import { useParams } from 'react-router-dom';
import { Button, Box, Typography, CardHeader, Avatar, } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import ReadOnlySlate from '../../components/editor/ReadOnlySlate'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { checkStructure } from '../../utils/checkStructure'
import { BlogContent } from '../../interfaces/interfaces'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import { VideoPlayer } from '../../components/common/VideoPlayer'
import { AudioPlayer, IPlaylist } from '../../components/common/AudioPlayer'
import { Responsive, WidthProvider } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import DynamicHeightItem from '../../components/DynamicHeightItem'
const ResponsiveGridLayout = WidthProvider(Responsive)
const initialMinHeight = 2 // Define an initial minimum height for grid items

const loadLayoutsFromLocalStorage = () => {
  try {
    const storedLayouts = localStorage.getItem('myGridLayouts')
    if (storedLayouts) {
      return JSON.parse(storedLayouts)
    }
  } catch (err) {
    console.error('Failed to load layouts from localStorage:', err)
  }
}
const saveLayoutsToLocalStorage = (layouts: any) => {
  try {
    localStorage.setItem('myGridLayouts', JSON.stringify(layouts))
  } catch (err) {
    console.error('Failed to save layouts to localStorage:', err)
  }
}

const lg = [
  { i: 'a', x: 0, y: 0, w: 6, h: initialMinHeight },
  { i: 'b', x: 6, y: 0, w: 6, h: initialMinHeight }
]
export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams()
  const { user: userState } = useSelector((state: RootState) => state.auth)
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [currAudio, setCurrAudio] = React.useState<number | null>(null)
  const [layouts, setLayouts] = React.useState<any>(
    loadLayoutsFromLocalStorage() || { lg }
  )
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<any>()
  const handleLayoutChange = (layout: any, layoutss: any) => {
    // const redoLayouts = setAutoHeight(layoutss)
    setLayouts(layoutss)
    saveLayoutsToLocalStorage(layoutss)
  }
  const [blogContent, setBlogContent] = React.useState<BlogContent | null>(null)

  const getBlogPost = React.useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true))
      const url = `/arbitrary/BLOG_POST/${user}/${postId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log({ response })
      const responseData = await response.json()
      if (checkStructure(responseData)) {
        setBlogContent(responseData)
        if (responseData?.layouts) {
          setLayouts(responseData?.layouts)
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [user, postId])
  React.useEffect(() => {
    getBlogPost()
  }, [])

  const getAvatar = React.useCallback(async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      console.log({ url })
      setAvatarUrl(url)
    } catch (error) {}
  }, [user])
  React.useEffect(() => {
    getAvatar()
  }, [])

  const audios = React.useMemo<IPlaylist[]>(() => {
    const filteredAudios = (blogContent?.postContent || []).filter(
      (content) => content.type === 'audio'
    )

    return filteredAudios.map((fa) => {
      return {
        ...fa.content,
        id: fa.id
      }
    })
  }, [blogContent])
  console.log({ blogContent, audios })
  if (!blogContent) return null

  const onBreakpointChange = (newBreakpoint: any) => {
    setCurrentBreakpoint(newBreakpoint)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          maxWidth: '1400px',
          // margin: '15px',
          width: '95%'
        }}
      >
        {user === userState?.name && (
          <Button
            onClick={() => {
              navigate(`/${user}/${blog}/${postId}/edit`)
            }}
          >
            Edit Post
          </Button>
        )}
        <CardHeader
          onClick={() => {
            navigate(`/${user}/${blog}`)
          }}
          sx={{
            cursor: 'pointer',
            '& .MuiCardHeader-content': {
              overflow: 'hidden'
            },
            padding: '10px 0px'
          }}
          avatar={<Avatar src={avatarUrl} alt={`${user}'s avatar`} />}
          subheader={`Author: ${user}`}
        />
        <Typography
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: 'center'
          }}
        >
          {blogContent?.title}
        </Typography>
        <Content layouts={layouts} blogContent={blogContent}>
          {blogContent?.postContent?.map((section: any) => {
            if (section.type === 'editor') {
              return (
                <div key={section.id}>
                  <DynamicHeightItem
                    layouts={layouts}
                    onLayoutsChange={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                  >
                    <ReadOnlySlate content={section.content} />
                  </DynamicHeightItem>
                </div>
              )
            }
            if (section.type === 'image') {
              return (
                <div key={section.id}>
                  <DynamicHeightItem
                    layouts={layouts}
                    onLayoutsChange={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                  >
                    <img
                      key={section.id}
                      src={section.content.image}
                      className="post-image"
                    />
                  </DynamicHeightItem>
                </div>
              )
            }
            if (section.type === 'video') {
              return (
                <VideoPlayer
                  key={section.id}
                  name={section.content.name}
                  service={section.content.service}
                  identifier={section.content.identifier}
                />
              )
            }
            if (section.type === 'audio') {
              return (
                <Box
                  key={section.id}
                  onClick={() => {
                    const findIndex = audios.findIndex(
                      (item) => item.identifier === section.content.identifier
                    )
                    if (findIndex >= 0) {
                      setCurrAudio(findIndex)
                    }
                  }}
                  sx={{
                    display: 'flex',
                    padding: '5px',
                    gap: 1,
                    alignItems: 'center',
                    marginTop: '15px',
                    cursor: 'pointer'
                  }}
                >
                  <Typography variant="h5" sx={{}}>
                    {section.content.title}
                  </Typography>
                  <AudiotrackIcon />
                </Box>
              )
            }
          })}
        </Content>
        {audios.length > 0 && (
          <AudioPlayer currAudio={currAudio} playlist={audios} />
        )}
      </Box>
    </Box>
  )
}

const Content = ({ children, layouts, blogContent }: any) => {
  if (layouts && blogContent?.layouts) {
    return (
      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={{ md: 996, sm: 768, xs: 480 }}
        cols={{ md: 4, sm: 3, xs: 1 }}
        measureBeforeMount={false}
        autoSize={true}
        // compactType={null}
        isBounded={true}
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        rowHeight={30}
        isDraggable={false}
        isResizable={false}
      >
        {children}
      </ResponsiveGridLayout>
    )
  }
  return children
}