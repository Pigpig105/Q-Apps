import Button from '@mui/material/Button';
import React from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import {
  Box,
  Tooltip,
  Popover,
  List,
  ListItem,
  Typography,
  IconButton,
} from "@mui/material";
import { togglePublishBlogModal } from '../../state/features/globalSlice';

export const BlogList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

  const dispatch = useDispatch();

    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = React.useState<any[]>([])
    const checkStructure = (content: any)=> {
      let isValid = true
      if (!Array.isArray(content)) isValid = false
    
      content.forEach((c: any)=> {
        if (!c.type) {
          isValid = false;
        }
        if (!c.version) {
          isValid = false;
        }
        if (!c.id) {
          isValid = false;
        }
        if (!c.content) {
          isValid = false;
        }
        if (c.version === 1 && c.type !== 'editor' && c.type !== 'image') {
          isValid = false;
        }
      });
    
      return isValid
    }


    const getBlogPost = React.useCallback(async(user: string, postId: string)=> {
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/BLOG_POST/${user}/${postId}`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
        if(checkStructure(responseData)){
          setBlogPosts((prev)=> [...prev, {...responseData, user, postId}])
        }
        return {
          ...responseData,
          user,
          postId
        }
      } catch (error) {
        
      }
    }, [])

    const getBlogPosts = React.useCallback(async()=> {
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
      

for (const content of responseData) {
  if (content.name && content.identifier) {
    await getBlogPost(content.name, content.identifier);
  }
}
      } catch (error) {
        
      }
    }, [])
    React.useEffect(()=> {
      getBlogPosts()
    }, [])
console.log({blogPosts})

  return (
    <>

  
 
     <div>BlogList</div>
        {!currentBlog && !isLoadingCurrentBlog && (
            <Button onClick={()=> {
              dispatch(
               togglePublishBlogModal(true)
             );
            }}>Create Blog</Button>
        )} 
         {currentBlog  && (
            <Button onClick={()=> {
              navigate(`/${user?.name || 'Phil'}/${currentBlog.blogId}`)
            }}>View my blog - {currentBlog.title}</Button>
        )} 
        
   
    <Button onClick={() => {
      navigate(`/post/new`)
    }}>New Post</Button>
    

  

  
      <List sx={{ margin: "0px", padding: "10px" }}>
                        {blogPosts.map((blogPost, index) => (
                            <ListItem
                                disablePadding
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                    width: "100%",
                                }}
                                key={blogPost.postId}
                            >
                                   <Button 
                                   onClick={()=> {
                                    const str = blogPost.postId
const arr = str.split("-post");
const str1 = arr[0];


                                    navigate(`/${blogPost.user}/${str1}/${blogPost.postId}`)
                                   }}
       key={blogPost.postId}
       >
       View{blogPost.postId}
       </Button>
       {blogPost.user === user?.name && (
         <Button onClick={
          ()=> {
            const str = blogPost.postId
  const arr = str.split("-post");
  const str1 = arr[0];
            navigate(`/${blogPost.user}/${str1}/${blogPost.postId}/edit`)
          }
        } key={blogPost.postId}>Edit{blogPost.postId}</Button>
       )}
      
                            </ListItem>
                        ))}
                    </List>
     
     
  
    </>
   
  )
}