import React from 'react';
import {
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from "react-share";

const components = [
  EmailShareButton, 
  FacebookShareButton, 
  LinkedinShareButton, 
  TwitterShareButton];
const icons = [
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
]
export default function Share(props) {
  const {url, title} = props;
  console.log(url);
  
  return (
    components.map((Comp,i ) => {
      const Icon = icons[i];
      return(
        <Comp 
          url={url}
          title={title}> 
          <Icon size={28} round={true} />
        </Comp>
      )
    })
  )
}