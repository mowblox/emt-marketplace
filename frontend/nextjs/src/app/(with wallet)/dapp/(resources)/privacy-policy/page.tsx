"use client";
import React, { useEffect, useState } from "react";
import useBackend from "@/lib/hooks/useBackend";
import { RichTextDisplayContainer } from "@/components/ui/rich-text-display-container";
import { formatDistance } from 'date-fns';
import { PolicyDoc } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import DataLoading from "@/components/ui/data-loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const PrivacyPolicyPage = () => {
  const { fetchPrivacyPolicy } = useBackend();


  let post: PolicyDoc | undefined;

  // if (cachedPosts) {
  //   cachedPosts.pages.find((page: Content[]) => {
  //     post = page.find((post) => { post.metadata.id === params.slug })
  //   })
  // }

  // const { user } = useUser();

  const { data: newPost, isLoading, error } = useQuery({
    queryKey: [],
    queryFn: () => fetchPrivacyPolicy(),
    enabled: !post,
    select(data) {
      post = data
      return data
    },
  });

  post = newPost;

  if (!post && isLoading) {
    return (<div className="h-screen">
      <DataLoading />
    </div>)
  }
  
  
  return (
    <div className="col-span-4">
      <div className="mb-8">
          <h4 className='text-xl md:text-xl font-semibold tracking-wider '>MEMM! Privacy Policy</h4>
          <div className='text-[11px] text-muted'>Last updated: {post!.timestamp.toDate().toDateString()}</div>
      </div>

      <RichTextDisplayContainer richText={post!.body} />

      {/* <div className="mt-8">
        <h4 className='text-md font-semibold tracking-wider '>Contact Us</h4>
        <p className="text-muted text-sm">
          If you have other questions about this Privacy Policy, please contact us at:
        </p>

      </div> */}

      <div className="mt-8">
          {/* <h4 className="text-sm font-semibold text-accent-3">MEMM!</h4> */}
        {/* <p className="text-muted text-sm">
          Banana street, East Legon <br />
          Accra, Ghana
        </p>

        <p className="text-muted text-sm">
        For email enquiries about this Privacy Policy, please contact us <Button variant="link" className="px-0 py-0 text-accent-3" asChild>
          <Link href="email:info@mowblox.com">
            here
          </Link>
          </Button>
          .
        </p> */}

      </div>

    </div>
  );
};

export default PrivacyPolicyPage;
