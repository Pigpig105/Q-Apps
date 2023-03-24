import React, { useState, useEffect } from 'react'
import { styled, Box } from '@mui/system'
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  ButtonBase,
  Button
} from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'

interface VideoPanelProps {
  onSelect: (video: Video) => void
  height?: string
  width?: string
}

interface VideoApiResponse {
  videos: Video[]
}

const Panel = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 10px;
  height: 100%;
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`

const PublishButton = styled(Button)`
  /* position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: auto; */
  max-width: 80%;
`

const fetchVideos = async (): Promise<Video[]> => {
  // Replace this URL with the actual API endpoint
  let res = await qortalRequest({
    action: 'LIST_QDN_RESOURCES',
    service: 'VIDEO',
    name: 'AlphaX',
    includeMetadata: true,
    limit: 100,
    offset: 0,
    reverse: true
  })
  console.log({ res })
  return res
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  onSelect,
  height,
  width
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    fetchVideos().then((fetchedVideos) => setVideos(fetchedVideos))
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClick = (video: Video) => {
    onSelect(video)
  }

  return (
    <Box>
      <VideoCallIcon
        onClick={handleToggle}
        sx={{
          height: height || '50px',
          width: width || '50px',
          cursor: 'pointer'
        }}
      ></VideoCallIcon>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleToggle}
        ModalProps={{
          keepMounted: true // Better performance on mobile
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '400px'
          }
        }}
      >
        <Panel>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '0 0'
            }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{ flexGrow: 1, mt: 2, mb: 1 }}
            >
              Select Video
            </Typography>
            <Typography
              variant="subtitle2"
              component="div"
              sx={{ flexGrow: 1, mb: 2 }}
            >
              List of videos in QDN under your name
            </Typography>
          </Box>

          <List
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              overflow: 'auto'
            }}
          >
            {videos.map((video) => (
              <ListItem key={video.identifier}>
                <ButtonBase
                  onClick={() => handleClick(video)}
                  sx={{ width: '100%' }}
                >
                  <ListItemText
                    primary={video.metadata.title}
                    secondary={video.metadata.description}
                  />
                </ButtonBase>
              </ListItem>
            ))}
          </List>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              flex: '0 0 50px'
            }}
          >
            <PublishButton
              variant="contained"
              onClick={() => console.log('Publish new video')}
            >
              Publish new video
            </PublishButton>
          </Box>
        </Panel>
      </Drawer>
    </Box>
  )
}

// Add this to your 'types.ts' file
export interface Video {
  name: string
  service: string
  identifier: string
  metadata: {
    title: string
    description: string
    tags: string[]
    category: string
    categoryName: string
  }
  size: number
  created: number
  updated: number
}