"use client";
import React, { useReducer, useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import useBackend from "@/lib/hooks/useBackend";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/user";
import { isValidFileType, profilePlaceholderImage } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TAGS } from "@/lib/contants";
import { PROFILE_PAGE } from "@/app/(with wallet)/_components/page-links";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/lib/types";
import PageLoading from "@/components/ui/page-loading";
import NoData from "@/components/ui/no-data";


const formSchema = z.object({
  displayName: z
    .string()
    .min(1, {
      message: "Title can't be empty",
    })
    .optional(),
  username: z
    .string()
    .min(4, {
      message: "That username is too short. Use atleast 4 characters",
    })
    .optional(),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  about: z.string().optional(),
  profilePicture: z.string().optional().refine((value) => value ? isValidFileType(value) : true, {
    message: 'Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.',
  }),
  tags: z.array(z.string()).optional(),
});

const EditProfileForm = () => {
  const { user } = useUser();
  const router = useRouter();
  const { updateProfile, fetchProfile } = useBackend();
  const queryClient = useQueryClient();
  
  const uid = user?.uid!
  console.log('uid', uid)


  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => (console.log('running queryfn'), fetchProfile(uid)),
    // select: (data) => { setSelectedTags(data?.tags || []); return data }
  });
  console.log('profile on edit', profile)


  const imageRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      displayName: profile?.displayName,
      username: profile?.username,
      about: profile?.about,
      tags: profile?.tags,
      email: user?.email || "",
    },

  });
  const [selectedTags, setSelectedTags] = useState(profile?.tags || []);
  const [isButtonLoading, setButtonLoading] = useState(false)



  async function onSubmit(values: z.infer<typeof formSchema>) {
    setButtonLoading(true)
    function areArraysEqual(arr1?: Array<string>, arr2?: Array<string>) {
      if (!arr1 || !arr2) return false;
      if (arr1.length !== arr2.length) return false;

      const sortedArr1 = [...arr1].sort();
      const sortedArr2 = [...arr2].sort();

      return sortedArr1.every((value, index) => value === sortedArr2[index]);
    }
    //fix tags always updating @Jovells
    function getChanges(
      oldObj: { [key: string]: any },
      newObj: { [key: string]: any }
    ) {
      let changes: { [key: string]: any } = {};

      for (let key in newObj) {
        if (oldObj[key] !== newObj[key]) {
          changes[key] = newObj[key];
        }
      }
      console.log("changes", changes)

      return changes;
    }
    console.log("formvalues, profile", values, profile, user);
    console.log("imagerRef.current", imageRef.current?.files?.[0]);
    const updates = getChanges(profile!, values);
    !areArraysEqual(profile?.tags, selectedTags) && (updates.tags = selectedTags);
    const profilePicture = imageRef.current?.files?.[0];
    profilePicture && (updates.profilePicture = profilePicture);
    delete updates.photoURL;
    try {
      const updateResult = await updateProfile(updates);
      console.log('result', updateResult) 
      if('updateValidationError' in updateResult){
          for (const key in updateResult.updateValidationError.validationResult) {
            console.log('key', key)
            //@ts-ignore
            form.setError(key, {
              type: "manual",
              message: key + " taken",
            });
          }
          throw new Error('Error updating profile' + updateResult)
      }
      toast({
        title: "Profile updated!",
        variant: "success",
      });
      
      setButtonLoading(false)
      queryClient.setQueryData(['profile', uid], (oldData: UserProfile)=>{
        return {...oldData, ...updateResult}
      })
      router.push(PROFILE_PAGE(uid));
    } catch (err) {
      console.log("err", err);
      toast({
        title: "Error updating profile",
        variant: "destructive",
      });
      setButtonLoading(false)
    }
  }
  if (!profile && isLoading) {
    return (
      <PageLoading/>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen">
        <NoData message="Error Loading Profile" />
      </div>
    );
  }
  console.log('escaped', profile)

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormControl className="mb-3">
                  <>
                    <div className="w-20 h-20 rounded-full relative">
                      <Image
                        src={
                          imageRef.current?.files?.[0]
                            ? URL.createObjectURL(imageRef.current?.files?.[0])
                            : profile?.photoURL || profilePlaceholderImage
                        }
                        fill
                        placeholder={profilePlaceholderImage}
                        className="object-cover rounded-full"
                        alt={`Preview your profile picture`}
                      />
                    </div>

                    <Input
                      placeholder="New Profile Picture"
                      className="mb-4"
                      type="file"
                      {...field}
                      ref={imageRef}
                    />
                    <div className="mb-4"></div>
                  </>
                </FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
          disabled
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-muted font-normal" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea placeholder="Say what you're about" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="flex gap-3 flex-wrap w-full">
                    {TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      const setTags = () =>
                        setSelectedTags(
                          isSelected
                            ? selectedTags.filter(
                              (item: string) => item !== tag
                            )
                            : [...selectedTags, tag]
                        );
                      return (
                        <Button
                          type="button"
                          onClick={setTags}
                          key={`skills-tags-${tag}`}
                          className="rounded-full text-sm "
                          size="sm"
                          variant={isSelected ? "default" : "outline"}>
                          {tag}
                          {isSelected ? (
                            <Minus className="w-4 h-4 text-muted ml-2" />
                          ) : (
                            <Plus className="w-4 h-4 text-accent-2 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end w-full">
            {/* FIX: @jovells when i click cancel it shows "profile update" before routing to the profile page, why is that? */}
            <Button onClick={(e) => {e.preventDefault(); router.push(PROFILE_PAGE(uid)); }} variant="outline" className="w-[160px] mr-3">
              Cancel
            </Button>
            <Button type="submit" isLoading={isButtonLoading} loadingText='Updating profile' variant="default" className="w-[160px] ">
              Update Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProfileForm;
