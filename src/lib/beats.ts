import beat1 from '@/assets/beat-covers/beat_1.png';
import beat2 from '@/assets/beat-covers/beat_2.jpg';
import beat3 from '@/assets/beat-covers/beat_3.jpg';
import beat4 from '@/assets/beat-covers/beat_4.jpg';
import beat5 from '@/assets/beat-covers/beat_5.jpg';
import beat6 from '@/assets/beat-covers/beat_6.jpg';

import { Beat } from './types';
export const beats: Beat[] = [
  {
    name: 'BOX',
    type: 'BROCKHAMPTON x DOECHII x JID',
    youtubeUrl: 'https://www.youtube.com/watch?v=vh1Qqvkzz6Y',
    image: beat1.src,
    bpm: 100,
  },
  {
    name: 'WARNING',
    type: 'KANYE WEST x YEEZUS',
    youtubeUrl: 'https://www.youtube.com/watch?v=iD81oFm3KJs',
    image: beat2.src,
    bpm: 95,
  },
  {
    name: 'SUB EVIL',
    type: 'KENDRICK LAMAR x JID x DOECHII',
    youtubeUrl: 'https://www.youtube.com/watch?v=fsdhK3mbCm4',
    image: beat3.src,
    bpm: 93,
  },
  {
    name: 'BROKE',
    type: 'KANYE WEST x DOECHII x KENDRICK LAMAR',
    youtubeUrl: 'https://www.youtube.com/watch?v=A0y4Cw5vgNE',
    image: beat4.src,
    bpm: 102,
  },
  {
    name: 'TEETH',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=OMqPDCMvalY',
    image: beat5.src,
    bpm: 125,
  },
  {
    name: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat6.src,
    bpm: 107,
  },
];

export default beats;
