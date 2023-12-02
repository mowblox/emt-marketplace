import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { profilePlaceholderImage } from '@/lib/utils';
import { profile } from 'console';
import { Minus, Plus } from 'lucide-react';
import { Input } from 'postcss';
import React from 'react'
import { Form } from 'react-hook-form';

const SessionReviewForm = () => {
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
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="flex gap-3 flex-wrap w-full">
                        {[
                          "Blockchain",
                          "Engineering",
                          "Graphic Design",
                          "Music",
                          "Web3",
                          "UX design",
                        ].map((tag, key) => {
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
                <Button variant="outline" className="w-[160px] mr-3">
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="w-[160px] ">
                  Update Profile
                </Button>
              </div>
            </form>
          </Form>
        </div>
      );
}

export default SessionReviewForm