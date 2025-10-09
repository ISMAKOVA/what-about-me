'use client';
import { MoveLeft, MoveRight } from 'lucide-react';

import { TransitionLink } from '../ui/transition-link';
import './styles.css';

export const Navbar = () => {
  return (
    <nav>
      <div className="font-cabinet absolute grid h-screen grid-rows-3 place-content-between gap-1">
        <ul className="mt-6 ml-6 font-bold">
          <li>
            <TransitionLink href="/work">
              <span>
                WORK <span className="text-tiny absolute top-2.5">(24)</span>
              </span>
              <MoveRight />
            </TransitionLink>
          </li>
        </ul>

        <ul className="row-start-3 mb-1 ml-6 flex self-end font-bold">
          <li className="origin-top-left -rotate-90">
            <TransitionLink href="/contact" className="flex justify-start gap-2">
              <MoveLeft />
              <span className="">CONTACT</span>
            </TransitionLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};
