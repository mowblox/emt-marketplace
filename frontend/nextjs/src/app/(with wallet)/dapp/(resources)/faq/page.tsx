"use client";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/forms/search";
import React from "react";
import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { ExpertTicket, ExptListing, UserProfile } from "@/lib/types";
import ExpertHubCard from "@/components/ui/expert-hub-card";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "@/components/ui/infinite-scroller";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FaqPage = () => {
  const { fetchExptListings } = useBackend();
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const dummyFaqs = [
    {
      question: 'What is MEMM?',
      answer: 'MEMM! is a blockchain-powered mentorship platform designed to connect mentors and learners across various industries. It leverages decentralized technology to foster a secure, transparent, and rewarding mentorship experience.'
    },
    {
      question: 'How does the reputation system work?',
      answer: 'MEMM! is a blockchain-powered mentorship platform designed to connect mentors and learners across various industries. It leverages decentralized technology to foster a secure, transparent, and rewarding mentorship experience.'
    },
    {
      question: 'What are EXPT Tokens?',
      answer: 'MEMM! is a blockchain-powered mentorship platform designed to connect mentors and learners across various industries. It leverages decentralized technology to foster a secure, transparent, and rewarding mentorship experience.'
    },
    {
      question: 'How can I earn EXPT Tokens?',
      answer: 'MEMM! is a blockchain-powered mentorship platform designed to connect mentors and learners across various industries. It leverages decentralized technology to foster a secure, transparent, and rewarding mentorship experience.'
    },
    {
      question: 'How do I become a expert on MEMM?',
      answer: 'MEMM! is a blockchain-powered mentorship platform designed to connect mentors and learners across various industries. It leverages decentralized technology to foster a secure, transparent, and rewarding mentorship experience.'
    },
  ]

  return (
    <div className="col-span-4">
      <h4 className='text-xl md:text-xl font-semibold tracking-wider mb-8'>Frequently Asked Questions  </h4>
      <Accordion type="single" collapsible className="flex flex-col gap-2">
      {
        dummyFaqs.map((faq, key) => <AccordionItem value={`faq-key-${key}`} key={`faq-yey-${key}`}>
        <AccordionTrigger>{faq.question}</AccordionTrigger>
        <AccordionContent>{faq.answer}</AccordionContent>
      </AccordionItem>)
      }
        
      </Accordion>
    </div>
  );
};

export default FaqPage;
