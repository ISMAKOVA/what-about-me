import beat1 from '@/assets/beat-covers/beat_1.png';
import beat10 from '@/assets/beat-covers/beat_10.jpg';
import beat2 from '@/assets/beat-covers/beat_2.jpg';
import beat3 from '@/assets/beat-covers/beat_3.jpg';
import beat4 from '@/assets/beat-covers/beat_4.jpg';
import beat5 from '@/assets/beat-covers/beat_5.jpg';
import beat6 from '@/assets/beat-covers/beat_6.jpg';
import beat7 from '@/assets/beat-covers/beat_7.jpg';
import beat8 from '@/assets/beat-covers/beat_8.jpg';
import beat9 from '@/assets/beat-covers/beat_9.jpg';

import { Beat } from './types';
export const beats: Beat[] = [
  {
    id: 'beat-01',
    title: 'BOX',
    type: 'BROCKHAMPTON x DOECHII x JID',
    youtubeUrl: 'https://www.youtube.com/watch?v=vh1Qqvkzz6Y',
    image: beat1.src,
    previewUrl: '/audio/beat_01.mp3',
    bpm: 100,
  },
  {
    id: 'beat-02',
    title: 'WARNING',
    type: 'KANYE WEST x YEEZUS',
    youtubeUrl: 'https://www.youtube.com/watch?v=iD81oFm3KJs',
    image: beat2.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 95,
  },
  {
    id: 'beat-03',
    title: 'SUB EVIL',
    type: 'KENDRICK LAMAR x JID x DOECHII',
    youtubeUrl: 'https://www.youtube.com/watch?v=fsdhK3mbCm4',
    image: beat3.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 93,
  },
  {
    id: 'beat-04',
    title: 'BROKE',
    type: 'KANYE WEST x DOECHII x KENDRICK LAMAR',
    youtubeUrl: 'https://www.youtube.com/watch?v=A0y4Cw5vgNE',
    image: beat4.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 102,
  },
  {
    id: 'beat-05',
    title: 'TEETH',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=OMqPDCMvalY',
    image: beat5.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 125,
  },
  {
    id: 'beat-06',
    title: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat6.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 107,
  },
  {
    id: 'beat-07',
    title: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat7.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 107,
  },
  {
    id: 'beat-08',
    title: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat8.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 107,
  },
  {
    id: 'beat-09',
    title: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat9.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 107,
  },
  {
    id: 'beat-10',
    title: 'NAME',
    type: 'JPEGMAFIA x DEATH GRIPS x EXPERIMENTAL',
    youtubeUrl: 'https://www.youtube.com/watch?v=r2-bOuqfsb4',
    image: beat10.src,
    previewUrl: '/audio/beat_02.mp3',
    bpm: 107,
  },
];

export default beats;
