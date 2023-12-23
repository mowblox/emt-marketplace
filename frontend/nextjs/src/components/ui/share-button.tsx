import { useState } from 'react';
import {Button} from './button';
import {Popover} from './popover';
import {EmailShareButton, FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailIcon, FacebookIcon, LinkedinIcon, TwitterIcon, XIcon} from 'react-share'
import { toast } from './use-toast';
import { HiOutlineShare } from 'react-icons/hi2';
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

export default function ShareButton({title,  path} : {title: string, path: string}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
        title: 'Link copied to clipboard',
        variant: 'success',
    })
    setIsOpen(false);
  };
  const url = location.origin + path

  return (
    <div>

        <Popover open={isOpen}>
          <PopoverTrigger asChild>
     <Button  onClick={handleButtonClick} variant="ghost" aria-label='Share post' size="icon">
    <HiOutlineShare className="h-5 w-5 text-foreground" />
    </Button>
            </PopoverTrigger>
            <PopoverContent onInteractOutside={() => setIsOpen(false)} sideOffset={12} alignOffset={0} align="end" className=" shadow-lg p-2 rounded flex space-x-2 bg-accent-shade">

          <LinkedinShareButton title={title}  url={url} ><LinkedinIcon size={32} round/></LinkedinShareButton>
          <TwitterShareButton title={title}  url={url} ><XIcon size={32} round/></TwitterShareButton>
          <EmailShareButton subject={title}  url={url} ><EmailIcon size={32} round/></EmailShareButton>
          <FacebookShareButton title={title}  url={url} ><FacebookIcon size={32} round/></FacebookShareButton>
          <Button variant={'outline'} size={'sm'} onClick={handleCopyLink}>Copy Link</Button>
          </PopoverContent>
        </Popover>
      
    </div>
  );
};

