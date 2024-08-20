const BeeLogoSvg = (props) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" stroke="black" strokeWidth="2">
       
        <circle cx="32" cy="20" r="6" fill="black" />
  
       
        <ellipse cx="32" cy="36" rx="10" ry="16" fill="rgb(204,255,204)" />
        <line x1="22" y1="36" x2="42" y2="36" stroke="black" strokeWidth="2" />
        <line x1="22" y1="42" x2="42" y2="42" stroke="black" strokeWidth="2" />
        <line x1="22" y1="30" x2="42" y2="30" stroke="black" strokeWidth="2" />
  
        <ellipse cx="22" cy="20" rx="8" ry="12" fill="white" />
        <ellipse cx="42" cy="20" rx="8" ry="12" fill="white" />
  
       
        <line x1="28" y1="14" x2="24" y2="8" stroke="black" strokeWidth="2" />
        <line x1="36" y1="14" x2="40" y2="8" stroke="black" strokeWidth="2" />
      </g>
    </svg>
  );
  
  export default BeeLogoSvg;
  