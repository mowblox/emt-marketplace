"use client";
import React from "react";
import { ExpertTicket, ExptListing } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Globe2Icon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import DataLoading from "@/components/ui/data-loading";
import NoData from "@/components/ui/no-data";
import BookExpertDialogue from "./book-expert-dialogue";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "@/components/ui/infinite-scroller";
import { useUser } from "@/lib/hooks/user";

const FormSchema = z.object({
  availableDate: z.date({
    required_error: "A date is required.",
  }),
  message: z.string().optional(),
});

export function BookingCalendarForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const currentTimezone = "UTC Time (10:00)";

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        // {/* </pre> */}
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="availableDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Date &amp; Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[200px] pl-3 text-center text-foreground font-normal",
                        !field.value && "text-muted-foreground"
                      )}>
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    className="bg-accent-shade rounded-md p-3"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="">
          <div className="text-sm mb-2">Saturday, November 25</div>
          <div className="text-xs text-muted flex items-center">
            <Button variant="outline" className="text-xs w-[200px]">
              13:00
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share anything that might help the mentor prepare for the meeting"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-muted font-normal" />
            </FormItem>
          )}
        />

        <div className="">
          <div className="text-sm mb-2">Time Zone</div>
          <div className="text-xs text-muted flex items-center">
            <Globe2Icon className="w-4 h-4 mr-2" /> {currentTimezone}
            <Button
              variant="ghost"
              className="text-xs hover:bg-transparent text-accent-3 hover:text-accent-4">
              Update
            </Button>
          </div>
        </div>
        <div className="w-full flex justify-end mb-[240px]">
          <Button type="submit" className="w-[160px]">
            Book Session
          </Button>
        </div>
      </form>
    </Form>
  );
}


const BookExpert = () => {
  const { fetchExptListings } = useBackend();
  const {user} = useUser();

  return (
    <InfiniteScroll
      ItemComponent={BookExpertDialogue}
      getNextPageParam={(lastPage) => {
        return lastPage[lastPage.length - 1]?.timestamp;
      }}
      queryKey={["ownedExpt"]}
      filters={{mentee: user?.uid, key: 'djsj'}}
      fetcher={fetchExptListings}
      className="w-full flex flex-wrap gap-4 flex-grow"
    />
  );
};

export default BookExpert;
