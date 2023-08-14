/* eslint-disable react/no-unescaped-entities */
import { Button } from "../components/Button";
import Heading from "../components/Title";

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden items-center space-y-6 px-8 place-self-center">
      <div className="relative flex place-items-center ">
        <Heading>Identify top candidates with AI</Heading>
      </div>
      <div className="max-w-[700px] text-center self-center">
        Interview copilot for recruiters to better assess candidates' technical skills for Software Developer and Data Science roles
      </div>
      <div className="mb-32 grid text-center lg:mb-0 lg:text-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-purple-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-400 before:dark:opacity-10 after:dark:from-purple-600 after:dark:via-[#b201ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
      </div>
      <div>
        <Button href="https://airtable.com/shr6xLClSmMJF6Jc0">
          Book a demo
        </Button>
      </div>
      <div className="text-center overflow-x-hidden">
        <iframe width="824" height="426" src="https://www.youtube.com/embed/pN5ZQIQhnMs" title="Persona AI - Software Developer Interview Demo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
      </div>
    </div>
  )
}
