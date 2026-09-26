import { CinematicHero } from '../components/sections/CinematicHero'
import { StatsBand } from '../components/sections/StatsBand'
import { Work } from '../components/sections/Work'
import { Prompts } from '../components/sections/Prompts'
import { Toolkit } from '../components/sections/Toolkit'
import { Research } from '../components/sections/Research'
import { EducationExperience } from '../components/sections/Credentials'
import { Contact } from '../components/sections/Contact'

export default function HomePage() {
  return (
    <main>
      <CinematicHero />
      <StatsBand />
      <Work />
      <Prompts />
      <Toolkit />
      <Research />
      <EducationExperience />
      <Contact />
    </main>
  )
}
