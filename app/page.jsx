"use client";

import { UserInterests } from "@/context/context";
import { useCompletion } from "ai/react";
import { validate } from "jsonschema";
import { Briefcase, Heart, Loader2, User2, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Balancer } from "react-wrap-balancer";

const schema = {
  type: "object",
  properties: {
    job_title: { type: "string" },
    job_description: { type: "string" },
    job_average_salary: { type: "string" },
    job_sector: { type: "string" },
  },
  required: [
    "job_title",
    "job_description",
    "job_average_salary",
    "job_sector",
  ],
  additionalProperties: false,
};

export default function Home() {
  const { likes, setLikes, dislikes, setDislikes } = useContext(UserInterests);

  const { complete } = useCompletion();

  const [db, setDb] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  //initialize db
  useEffect(() => {
    const addFirstJob = async () => {
      setLoading(true);

      const prompt = `Donne moi le nom d'un métier réel aléatoire, explique en quoi il consiste en 20 mots sans répéter le nom du métier, quel est son salaire annuel moyen en euros sous la forme "XXX XXX - XXX XXX€" et quel unique mot permet de comprendre dans quel secteur il exerce. Ta réponse sera en français et uniquement un objet JSON avec les propriétés "job_title", "job_description", "job_average_salary" et "job_sector" sans texte parasite autour.`;

      console.log("prompt", prompt);

      const res = await complete(prompt);

      console.log("result", res);

      if (res) {
        console.log("Answer generated");
        try {
          console.log(JSON.parse(res));
          validate(JSON.parse(res), schema);
          console.log(validate(JSON.parse(res), schema));
          const newJob = {
            id: 1,
            likes: `${likes}`,
            dislikes: `${dislikes}`,
            job: JSON.parse(res),
          };
          setDb((current) => [...current, newJob]);
          setJobs((current) => [...current, newJob]);
          setLoading(false);
        } catch (error) {
          console.log(error);
          addFirstJob();
        }
      } else {
        console.log("Failed to answer");
        addFirstJob();
      }
    };

    addFirstJob();
  }, []);

  //add job
  useEffect(() => {
    const addJob = async () => {
      setLoading(true);

      const prompt = `J'aime ces métiers : ${likes}. Je n'aime pas ces métiers : ${dislikes}. Donne moi le nom d'un métier réel aléatoire que je pourrais aimer, explique en quoi il consiste en 20 mots sans répéter le nom du métier, quel est son salaire annuel moyen en euros sous la forme "XXX XXX - XXX XXX€" et quel unique mot permet de comprendre dans quel secteur il exerce. Ta réponse sera en français et uniquement un objet JSON avec les propriétés "job_title", "job_description", "job_average_salary" et "job_sector" sans texte parasite autour.`;

      console.log("prompt", prompt);

      const res = await complete(prompt);

      console.log("result", res);

      if (res) {
        console.log("Answer generated");
        try {
          console.log(JSON.parse(res));

          console.log(validate(JSON.parse(res), schema));
          if (validate(JSON.parse(res), schema).valid) {
            console.log("Valid format");
            const newJob = {
              id: jobs.length + 1,
              likes: `${likes}`,
              dislikes: `${dislikes}`,
              job: JSON.parse(res),
            };
            if (
              !jobs
                .map((item) => item.job.job_title)
                .includes(newJob.job.job_title)
            ) {
              console.log("Job added");
              setDb((current) => [...current, newJob]);
              setJobs((current) => [...current, newJob]);
              setLoading(false);
            } else {
              console.log("Job already exists");
              addJob();
            }
          } else {
            console.log("Invalid format");
            addJob();
          }
        } catch (error) {
          console.log(error);
          addJob();
        }
      } else {
        console.log("Failed to answer");
        addJob();
      }
    };

    if (db.length >= 1 && !loading && db.length < 5) {
      addJob();
    }
  }, [db]);

  return (
    <div className="h-screen flex flex-col items-center overflow-hidden">
      <h1 className="p-6 text-2xl font-bold text-fuchsia-500">Workle</h1>
      <div className="relative w-full h-full">
        {db.length > 0 ? (
          db.map((item, index) => (
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[97vw] h-full text-white bg-[url(https://source.unsplash.com/200x200/?${item.job.job_sector})] bg-cover rounded-xl shadow-sm`}
              style={{
                zIndex: `-${index}`,
                backgroundImage: `URL(https://source.unsplash.com/600x1000/?${item.job.job_sector})`,
              }}
              key={index}
            >
              <div className="flex flex-col justify-end w-full h-full bg-gradient-to-t from-gray-950 to-transparent rounded-xl p-5">
                <div className="space-y-10">
                  <div className="">
                    <div className="text-3xl font-bold">
                      <Balancer>{item.job.job_title}</Balancer>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      <div className="bg-fuchsia-500/70 rounded-full px-4 py-2">
                        {item.job.job_average_salary}
                      </div>
                      <div className="bg-fuchsia-500/70 rounded-full px-4 py-2">
                        {item.job.job_sector}
                      </div>
                    </div>
                    <div className="mt-5 text-md">
                      <Balancer>{item.job.job_description}</Balancer>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="border border-red-500 rounded-full p-5"
                      onClick={() => {
                        setDb((current) =>
                          current.filter((n) => n.job !== item.job)
                        );
                        setDislikes((current) => [
                          ...current,
                          item.job.job_title,
                        ]);
                      }}
                    >
                      <X size={26} color="#ef4444" />
                    </button>
                    <button
                      className="border border-green-500 rounded-full p-5"
                      onClick={() => {
                        setDb((current) =>
                          current.filter((n) => n.job !== item.job)
                        );
                        setLikes((current) => [...current, item.job.job_title]);
                      }}
                    >
                      <Heart size={26} color="#22c55e" fill="#22c55e" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center p-5 w-[97vw] h-full rounded-xl shadow-sm text-gray-950 gap-5">
            <svg class="animate-spin h-10 w-10" viewBox="0 0 24 24">
              <Loader2 />
            </svg>
            <span className="text-center text-md">
              Chargement de nouveaux métiers
            </span>
            <span className="text-center text-xs">
              Patientez quelques secondes
            </span>
          </div>
        )}
      </div>
      <div className="flex w-full justify-between items-center mt-5 pt-5 pb-10 px-8 border-t border-t-gray-300">
        <span className="text-xl font-bold text-fuchsia-500">W</span>
        <Briefcase size={24} color="#6b7280" fill="#6b7280" />
        <User2 size={24} color="#6b7280" fill="#6b7280" />
      </div>
    </div>
  );
}
