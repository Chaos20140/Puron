export function PuronLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
      {/* Outer Hexagon (Black) */}
      <polygon 
        points="50,4 90,27 90,73 50,96 10,73 10,27" 
        fill="#0A0A0D" 
        stroke="#2A2A2D" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      
      {/* Purple Faces */}
      {/* Left Vertical Face */}
      <polygon 
        points="30,40 50,51 50,80 30,69" 
        fill="#7C3AED" 
      />
      {/* Top Face */}
      <polygon 
        points="50,29 70,40 50,51 30,40" 
        fill="#A855F7" 
      />

      {/* White Outline Edges (The 3D wireframe P-Shape) */}
      <g stroke="#F5F5F7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Top Diamond */}
        <polygon points="50,29 70,40 50,51 30,40" fill="none" />
        
        {/* Center Vertical Edge */}
        <line x1="50" y1="51" x2="50" y2="80" />
        
        {/* Left Vertical Edge */}
        <line x1="30" y1="40" x2="30" y2="69" />
        
        {/* Right Vertical Edge (Shorter for the 'P' loop) */}
        <line x1="70" y1="40" x2="70" y2="61" />
        
        {/* Bottom Left Edge */}
        <line x1="30" y1="69" x2="50" y2="80" />
        
        {/* Bottom Right Inner Edge (connects bottom of right arm to center stem) */}
        <line x1="70" y1="61" x2="50" y2="72" />
      </g>
    </svg>
  );
}
