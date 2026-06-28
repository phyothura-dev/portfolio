import { motion } from 'framer-motion';
import { FiBriefcase, FiCalendar } from 'react-icons/fi';
import { experiences } from '../../data/experience';

export default function WorkExperience() {
  return (
    <section id="experience" className="py-20">
      <div className="mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-slate-100">My Work Experience</h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/70 via-gray-200 to-transparent dark:via-slate-700 md:block lg:left-1/2" />

          <div className="space-y-6">
            {experiences.map((experience, index) => (
              <motion.article
                key={`${experience.role}-${experience.company}`}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.42, ease: 'easeOut', delay: index * 0.05 }}
                className={`relative grid gap-4 md:grid-cols-[2rem_1fr] lg:grid-cols-[1fr_2rem_1fr] ${index % 2 === 1 ? 'lg:[&>div:last-child]:col-start-1 lg:[&>div:last-child]:row-start-1' : ''}`}
              >
                <div className="hidden lg:block" />

                <div className="relative z-10 hidden md:flex md:items-start md:justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-blue-300">
                    <FiBriefcase aria-hidden="true" />
                  </div>
                </div>

                <div className="group rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 dark:border-slate-700 dark:bg-slate-900/90">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary dark:bg-blue-400/10 dark:text-blue-300">
                          <FiCalendar aria-hidden="true" />
                          {experience.date}
                        </span>
                        <span className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 dark:border-slate-700 dark:text-slate-300">{experience.type}</span>
                        {experience.isCurrent && <span className="rounded-full bg-emerald-500 px-3 py-1 text-white shadow-sm shadow-emerald-500/20">Current</span>}
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight text-black dark:text-slate-100 md:text-xl">{experience.role}</h3>
                      <p className="mt-1 text-sm font-medium text-primary dark:text-blue-300">{experience.company}</p>
                    </div>
                   
                  </div>

                  <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-slate-300">{experience.summary}</p>

                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
