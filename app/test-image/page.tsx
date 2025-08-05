// app/test-image/page.tsx
import Image from 'next/image';

export default function TestImagePage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Image Test Page</h1>
      
      <div className="flex flex-col space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Direct Image Tag</h2>
          <img 
            src="/images/borosilicate-glass-laser-cleaning-hero.jpg" 
            alt="Test using img tag" 
            width={500} 
            height={300}
            className="border border-gray-300"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Using Next.js Image Component</h2>
          <div className="relative w-[500px] h-[300px] border border-gray-300">
            <Image
              src="/images/borosilicate-glass-laser-cleaning-hero.jpg"
              alt="Test using Next.js Image"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Using Symbolic Link Path</h2>
          <div className="relative w-[500px] h-[300px] border border-gray-300">
            <Image
              src="/images/borosilicate-laser-cleaning-hero.jpg"
              alt="Test using symbolic link"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
