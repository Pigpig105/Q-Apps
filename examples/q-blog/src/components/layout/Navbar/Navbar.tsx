import React, { useRef, useState } from 'react'
import {
  Typography,
  Box,
  Popover,
  useTheme,
  Button,
  Input
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AddBoxIcon from '@mui/icons-material/AddBox'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useNavigate } from 'react-router-dom'
import { togglePublishBlogModal } from '../../../state/features/globalSlice'
import { useDispatch, useSelector } from 'react-redux'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { RootState } from '../../../state/store'
import { UserNavbar } from '../../common/UserNavbar/UserNavbar'
import { removePrefix } from '../../../utils/blogIdformats'
import { useLocation } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import SubscriptionsIcon from '@mui/icons-material/Subscriptions'
import { BlockedNamesModal } from '../../common/BlockedNamesModal/BlockedNamesModal'
import SearchIcon from '@mui/icons-material/Search'
import EmailIcon from '@mui/icons-material/Email'

import BackspaceIcon from '@mui/icons-material/Backspace'
import {
  AvatarContainer,
  CreateBlogButton,
  CustomAppBar,
  CustomToolbar,
  DropdownContainer,
  DropdownText,
  QblogLogoContainer,
  StyledButton,
  AuthenticateButton,
  NavbarName
} from './Navbar-styles'
import { AccountCircleSVG } from '../../../assets/svgs/AccountCircleSVG'
import QblogLogo from '../../../assets/img/qBlogLogo.png'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import { NewWindowSVG } from '../../../assets/svgs/NewWindowSVG'
import {
  addFilteredPosts,
  setFilterValue,
  setIsFiltering
} from '../../../state/features/blogSlice'
interface Props {
  isAuthenticated: boolean
  hasBlog: boolean
  userName: string | null
  userAvatar: string
  blog: any
  authenticate: () => void
  hasAttemptedToFetchBlogInitial: boolean
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const NavBar: React.FC<Props> = ({
  isAuthenticated,
  hasBlog,
  userName,
  userAvatar,
  blog,
  authenticate,
  hasAttemptedToFetchBlogInitial
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const query = useQuery()
  const { visitingBlog } = useSelector((state: RootState) => state.global)
  const location = useLocation()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [isOpenModal, setIsOpenModal] = React.useState<boolean>(false)
  const [searchVal, setSearchVal] = useState<string>('')
  const searchValRef = useRef('')
  const inputRef = useRef<HTMLInputElement>(null)
  const stripBlogId = removePrefix(visitingBlog?.blogId || '')
  if (visitingBlog?.navbarConfig && location?.pathname?.includes(stripBlogId)) {
    return (
      <UserNavbar
        title={visitingBlog?.title || ''}
        menuItems={visitingBlog?.navbarConfig?.navItems || []}
        name={visitingBlog?.name || ''}
        blogId={visitingBlog?.blogId || ''}
      />
    )
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as unknown as HTMLButtonElement | null
    setAnchorEl(target)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const onClose = () => {
    setIsOpenModal(false)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <CustomAppBar position="sticky" elevation={2}>
      <CustomToolbar variant="dense">
        <QblogLogoContainer
          src={QblogLogo}
          alt="Qblog Logo"
          onClick={() => {
            navigate(`/`)
            dispatch(setIsFiltering(false))
            dispatch(setFilterValue(''))
            dispatch(addFilteredPosts([]))
            searchValRef.current = ''
            if (!inputRef.current) return
            inputRef.current.value = ''
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Input
            id="standard-adornment-name"
            inputRef={inputRef}
            onChange={(e) => {
              searchValRef.current = e.target.value
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.keyCode === 13) {
                if (!searchValRef.current) {
                  dispatch(setIsFiltering(false))
                  dispatch(setFilterValue(''))
                  dispatch(addFilteredPosts([]))
                  searchValRef.current = ''
                  if (!inputRef.current) return
                  inputRef.current.value = ''
                  return
                }
                navigate('/')
                dispatch(setIsFiltering(true))
                dispatch(addFilteredPosts([]))
                dispatch(setFilterValue(searchValRef.current))
              }
            }}
            placeholder="Filter by name"
            sx={{
              '&&:before': {
                borderBottom: 'none'
              },
              '&&:after': {
                borderBottom: 'none'
              },
              '&&:hover:before': {
                borderBottom: 'none'
              },
              '&&.Mui-focused:before': {
                borderBottom: 'none'
              },
              '&&.Mui-focused': {
                outline: 'none'
              },
              fontSize: '18px'
            }}
          />

          <SearchIcon
            sx={{
              cursor: 'pointer'
            }}
            onClick={() => {
              if (!searchValRef.current) {
                dispatch(setIsFiltering(false))
                dispatch(setFilterValue(''))
                dispatch(addFilteredPosts([]))
                searchValRef.current = ''
                if (!inputRef.current) return
                inputRef.current.value = ''
                return
              }
              navigate('/')
              dispatch(setIsFiltering(true))
              dispatch(addFilteredPosts([]))
              dispatch(setFilterValue(searchValRef.current))
            }}
          />
          <BackspaceIcon
            sx={{
              cursor: 'pointer'
            }}
            onClick={() => {
              dispatch(setIsFiltering(false))
              dispatch(setFilterValue(''))
              dispatch(addFilteredPosts([]))
              searchValRef.current = ''
              if (!inputRef.current) return
              inputRef.current.value = ''
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {/* Add isAuthenticated && before username and wrap StyledButton in this condition*/}
          {!isAuthenticated && (
            <AuthenticateButton onClick={authenticate}>
              <ExitToAppIcon />
              Authenticate
            </AuthenticateButton>
          )}
          {isAuthenticated &&
            userName &&
            hasAttemptedToFetchBlogInitial &&
            !hasBlog && (
              <CreateBlogButton
                onClick={() => {
                  dispatch(togglePublishBlogModal(true))
                }}
              >
                <NewWindowSVG color="#fff" width="18" height="18" />
                Create Blog
              </CreateBlogButton>
            )}
          {isAuthenticated && userName && hasBlog && (
            <>
              <StyledButton
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={() => {
                  navigate(`/post/new`)
                }}
              >
                Create Post
              </StyledButton>

              <StyledButton
                color="primary"
                startIcon={<AutoStoriesIcon />}
                onClick={() => {
                  navigate(`/${userName}/${blog.blogId}`)
                }}
              >
                My Blog
              </StyledButton>
            </>
          )}

          {isAuthenticated && userName && (
            <AvatarContainer onClick={handleClick}>
              <NavbarName>{userName}</NavbarName>
              {!userAvatar ? (
                <AccountCircleSVG
                  color={theme.palette.text.primary}
                  width="32"
                  height="32"
                />
              ) : (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  width="32"
                  height="32"
                  style={{
                    borderRadius: '50%'
                  }}
                />
              )}
              <ExpandMoreIcon id="expand-icon" sx={{ color: '#ACB6BF' }} />
            </AvatarContainer>
          )}
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
          >
            <DropdownContainer onClick={() => navigate('/favorites')}>
              <BookmarkIcon
                sx={{
                  color: '#50e3c2'
                }}
              />
              <DropdownText>Favorites</DropdownText>
            </DropdownContainer>
            <DropdownContainer onClick={() => navigate('/subscriptions')}>
              <SubscriptionsIcon
                sx={{
                  color: '#5f50e3'
                }}
              />
              <DropdownText>Subscriptions</DropdownText>
            </DropdownContainer>
            <DropdownContainer
              onClick={() => {
                setIsOpenModal(true)
                handleClose()
              }}
            >
              <PersonOffIcon
                sx={{
                  color: '#e35050'
                }}
              />
              <DropdownText>Blocked Names</DropdownText>
            </DropdownContainer>
            <DropdownContainer>
              <a
                href="qortal://APP/Q-Mail"
                className="qortal-link"
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center'
                }}
              >
                <EmailIcon
                  sx={{
                    color: '#50e3c2'
                  }}
                />

                <DropdownText>Q-Mail</DropdownText>
              </a>
            </DropdownContainer>
          </Popover>
          {isOpenModal && (
            <BlockedNamesModal open={isOpenModal} onClose={onClose} />
          )}
        </Box>
      </CustomToolbar>
    </CustomAppBar>
  )
}

export default NavBar
