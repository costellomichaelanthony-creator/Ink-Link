import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-ink-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-ink-950 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Your body is a canvas.</span>{' '}
                <span className="block text-brand">Find your artist.</span>
              </h1>
              <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Discover world-class tattoo artists, generate custom designs with AI, and book your next session seamlessly. The future of ink is here.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/design"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand hover:bg-brand-hover md:py-4 md:text-lg transition-all"
                  >
                    AI Design Studio
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/marketplace"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-accent bg-ink-800 hover:bg-ink-700 md:py-4 md:text-lg transition-all"
                  >
                    Browse Flash
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-ink-900 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-2 gap-4 p-8 opacity-40 transform rotate-12 scale-110">
           <img className="rounded-lg shadow-2xl" src="https://picsum.photos/300/400?random=20" alt="Tattoo 1" />
           <img className="rounded-lg shadow-2xl mt-12" src="https://picsum.photos/300/400?random=21" alt="Tattoo 2" />
           <img className="rounded-lg shadow-2xl" src="https://picsum.photos/300/400?random=22" alt="Tattoo 3" />
           <img className="rounded-lg shadow-2xl mt-12" src="https://picsum.photos/300/400?random=23" alt="Tattoo 4" />
        </div>
      </div>
    </div>
  );
};

export default Hero;