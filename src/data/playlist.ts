// Cover art — square JPG/PNG assets co-located with the playlist.
// Vite resolves these to final URLs at build time.
import midnightCity from '../covers/MidnightCity.jpg';
import somethingAboutUs from '../covers/SomethingAboutUs.png';
import theLessIKnowTheBetter from '../covers/TheLessIKnowTheBetter.png';
import breathe from '../covers/Breathe.jpeg';
import glitterGold from '../covers/GlitterGold.jpg';
import dreams from '../covers/Dreams.jpeg';
import electricFeel from '../covers/ElectricFeel.jpg';
import paris from '../covers/Paris.png';

export interface Track {
  title: string;
  artist: string;
  duration: number; // seconds
  cover: string;    // resolved image URL
}

// Simulated commute playlist — independent of scenario simulation
export const playlist: Track[] = [
  { title: 'Midnight City', artist: 'M83', duration: 244, cover: midnightCity },
  { title: 'Something About Us', artist: 'Daft Punk', duration: 228, cover: somethingAboutUs },
  { title: 'The Less I Know the Better', artist: 'Tame Impala', duration: 216, cover: theLessIKnowTheBetter },
  { title: 'Breathe', artist: 'Télépopmusik', duration: 234, cover: breathe },
  { title: 'Glitter & Gold', artist: 'Barns Courtney', duration: 227, cover: glitterGold },
  { title: 'Dreams', artist: 'Fleetwood Mac', duration: 255, cover: dreams },
  { title: 'Electric Feel', artist: 'MGMT', duration: 230, cover: electricFeel },
  { title: 'Paris', artist: 'The Chainsmokers', duration: 221, cover: paris },
];
