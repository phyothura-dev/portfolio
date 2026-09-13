import { Card, CardContent } from "../../components/Card";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="grid mx-auto grid-cols-1 lg:grid-cols-2 justify-between gap-14 items-center">
        <div data-aos="fade-right" className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">Building useful, reliable software</h2>
          <p className="text-gray-700 leading-relaxed tracking-tight">
            Hello, I am <span className="font-semibold text-primary">Thura</span>. I’m currently working as a Senior IT Associate, System Integration at a logistics company. I focus on system integrations, Odoo ERP, and building web applications
            that streamline operations and deliver measurable value. I care about code quality, thoughtful UX, and maintainable systems.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 hover:border-primary/40 duration-300 transition-all cursor-auto p-4">
              <div className="text-2xl font-bold text-black">
                1+<span className="text-primary">y</span>
              </div>
              <div className="text-xs text-gray-600">Experience</div>
            </div>
            <div className="rounded-lg border border-gray-200 hover:border-primary/40 duration-300 transition-all cursor-auto p-4">
              <div className="text-2xl font-bold text-black">
                10+<span className="text-primary">%</span>
              </div>
              <div className="text-xs text-gray-600">Process gains</div>
            </div>
            <div className="rounded-lg border border-gray-200 hover:border-primary/40 duration-300 transition-all cursor-auto p-4">
              <div className="text-2xl font-bold text-black">Web</div>
              <div className="text-xs text-gray-600">Apps & APIs</div>
            </div>
          </div>
        </div>

        {/* Right: Details card */}
        <div data-aos="fade-left">
          <Card className="shadow-sm">
            <CardContent className="space-y-6 mt-4 ">
              {/* Interests */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-black">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: '🎧', label: 'Music' },
                    { icon: '✈️', label: 'Travel' },
                    { icon: '🎬', label: 'Movie' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-primary/40  transition"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-black">Focus areas</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span> Web application development
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span> RESTful APIs & backend
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span> Clean, maintainable code
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span> Business process automation
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
