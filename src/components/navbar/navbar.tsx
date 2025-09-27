'use client';
import { MoveLeft, MoveRight } from 'lucide-react';
import './styles.css';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav>
      <div className="font-cabinet absolute grid h-screen grid-rows-3 place-content-between gap-1">
        <ul className="mt-6 ml-6 font-bold">
          <li>
            <Link href="/work" className="flex gap-2">
              <span>WORK</span>
              <MoveRight />
            </Link>
          </li>
        </ul>

        <ul className="row-start-3 mb-1 ml-6 flex self-end font-bold">
          <li className="origin-top-left -rotate-90">
            <Link href="/contact" className="flex justify-start gap-2">
              <MoveLeft />
              <span className="">CONTACT</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
