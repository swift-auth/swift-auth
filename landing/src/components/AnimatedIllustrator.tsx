export function AnimatedIllustration() {
   return (
      <svg
         viewBox="0 0 480 400"
         className="w-full max-w-lg"
         xmlns="http://www.w3.org/2000/svg"
         xmlnsXlink="http://www.w3.org/1999/xlink"
         aria-hidden="true"
      >
         <style>{`
            .float  { animation: float 4s ease-in-out infinite;        transform-box: fill-box; transform-origin: center; }
            .float2 { animation: float 4s ease-in-out infinite 0.55s;  transform-box: fill-box; transform-origin: center; }
            .float3 { animation: float 4s ease-in-out infinite 1.1s;   transform-box: fill-box; transform-origin: center; }
            .float4 { animation: float 4s ease-in-out infinite 1.65s;  transform-box: fill-box; transform-origin: center; }
            .float5 { animation: float 4s ease-in-out infinite 2.2s;   transform-box: fill-box; transform-origin: center; }
            .dash   { stroke-dasharray: 5 5; animation: dashFlow 1.4s linear infinite; }
            .dash2  { stroke-dasharray: 5 5; animation: dashFlow 1.4s linear infinite reverse; }
            @keyframes float    { 0%,100%{ transform: translateY(0px) } 50%{ transform: translateY(-5px) } }
            @keyframes dashFlow { to { stroke-dashoffset: -20; } }
            @media (prefers-reduced-motion: reduce) {
               .float,.float2,.float3,.float4,.float5,.dash,.dash2 { animation: none; }
            }
         `}</style>

         <defs>
            <marker
               id="arr"
               viewBox="0 0 10 10"
               refX="8"
               refY="5"
               markerWidth="5"
               markerHeight="5"
               orient="auto-start-reverse"
            >
               <path
                  d="M2 1L8 5L2 9"
                  fill="none"
                  stroke="context-stroke"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </marker>
         </defs>

         {/* YOUR APP */}
         <g className="float">
            <rect
               x="8"
               y="128"
               width="124"
               height="112"
               rx="12"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <rect
               x="18"
               y="140"
               width="104"
               height="22"
               rx="5"
               fill="#262626"
               stroke="#282828"
               strokeWidth="0.5"
            />
            <circle cx="29" cy="151" r="3" fill="#343434" />
            <circle cx="40" cy="151" r="3" fill="#343434" />
            <circle cx="51" cy="151" r="3" fill="#343434" />
            <rect
               x="60"
               y="146"
               width="54"
               height="10"
               rx="3"
               fill="#171717"
               stroke="#343434"
               strokeWidth="0.5"
            />
            <rect x="18" y="171" width="72" height="5" rx="2.5" fill="#343434" />
            <rect x="18" y="182" width="54" height="5" rx="2.5" fill="#343434" opacity="0.6" />
            {/* sign in button — uses your CSS var for primary color */}
            <rect
               x="18"
               y="196"
               width="62"
               height="22"
               rx="6"
               fill="var(--primary-foreground)"
               opacity="0.9"
            />
            <text
               x="49"
               y="211"
               fontFamily="var(--font-mono)"
               fontSize="9"
               fontWeight="600"
               fill="var(--primary)"
               textAnchor="middle"
            >
               Sign in
            </text>
            <text
               x="70"
               y="258"
               fontFamily="var(--font-mono)"
               fontSize="10"
               fill="#737373"
               textAnchor="middle"
            >
               your app
            </text>
         </g>

         {/* auth req / token arrows */}
         <line
            className="dash"
            x1="135"
            y1="168"
            x2="194"
            y2="168"
            stroke="#525252"
            strokeWidth="1.2"
            markerEnd="url(#arr)"
         />
         <text
            x="164"
            y="161"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="#737373"
            textAnchor="middle"
         >
            auth req
         </text>
         <line
            className="dash2"
            x1="194"
            y1="184"
            x2="135"
            y2="184"
            stroke="#525252"
            strokeWidth="1.2"
            markerEnd="url(#arr)"
         />
         <text
            x="164"
            y="199"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="#737373"
            textAnchor="middle"
         >
            token
         </text>

         {/* traveling dots */}
         <circle r="2.5" fill="var(--primary-foreground)" opacity="0">
            <animateMotion dur="1.4s" repeatCount="indefinite" path="M135 168 L194 168" />
            <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
         </circle>
         <circle r="2.5" fill="var(--primary-foreground)" opacity="0">
            <animateMotion
               dur="1.4s"
               repeatCount="indefinite"
               begin="0.7s"
               path="M194 184 L135 184"
            />
            <animate
               attributeName="opacity"
               values="0;1;0"
               dur="1.4s"
               repeatCount="indefinite"
               begin="0.7s"
            />
         </circle>

         {/* AUTHIO CORE */}
         <g className="float2">
            <rect
               x="200"
               y="118"
               width="125"
               height="96"
               rx="14"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <image
               href="/logo.svg"
               x="215"
               y="122"
               width="95"
               height="52"
               preserveAspectRatio="xMidYMid meet"
            />
            {/* package pills */}
            <rect x="212" y="180" width="36" height="14" rx="7" fill="#282828" />
            <text
               x="230"
               y="191"
               fontFamily="var(--font-mono)"
               fontSize="8"
               fill="#a1a1a1"
               textAnchor="middle"
            >
               JWT
            </text>
            <rect x="254" y="180" width="44" height="14" rx="7" fill="#282828" />
            <text
               x="276"
               y="191"
               fontFamily="var(--font-mono)"
               fontSize="8"
               fill="#a1a1a1"
               textAnchor="middle"
            >
               OAuth
            </text>
            <rect x="304" y="180" width="14" height="14" rx="7" fill="#282828" />
            <text
               x="311"
               y="191"
               fontFamily="var(--font-mono)"
               fontSize="8"
               fill="#525252"
               textAnchor="middle"
            >
               …
            </text>
         </g>

         {/* persist arrow */}
         <line
            x1="260"
            y1="218"
            x2="260"
            y2="270"
            stroke="#343434"
            strokeWidth="1"
            strokeDasharray="4 4"
            markerEnd="url(#arr)"
         />
         <text x="278" y="248" fontFamily="var(--font-mono)" fontSize="9" fill="#737373">
            persist
         </text>

         {/* DATABASE */}
         <g className="float3">
            <rect
               x="192"
               y="272"
               width="136"
               height="62"
               rx="10"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <ellipse
               cx="218"
               cy="289"
               rx="13"
               ry="4.5"
               fill="none"
               stroke="#343434"
               strokeWidth="1.2"
            />
            <line x1="205" y1="289" x2="205" y2="309" stroke="#343434" strokeWidth="1.2" />
            <line x1="231" y1="289" x2="231" y2="309" stroke="#343434" strokeWidth="1.2" />
            <ellipse
               cx="218"
               cy="309"
               rx="13"
               ry="4.5"
               fill="#171717"
               stroke="#343434"
               strokeWidth="1.2"
            />
            <line x1="207" y1="298" x2="229" y2="298" stroke="#282828" strokeWidth="0.8" />
            <text x="238" y="294" fontFamily="var(--font-mono)" fontSize="9.5" fill="#fafafa">
               sessions
            </text>
            <text x="238" y="310" fontFamily="var(--font-mono)" fontSize="8.5" fill="#737373">
               users · tokens
            </text>
            {/* adapter labels */}
            <text x="238" y="326" fontFamily="var(--font-mono)" fontSize="7.5" fill="#525252">
               drizzle · prisma
            </text>
         </g>

         {/* provider connector lines */}
         <line
            x1="326"
            y1="144"
            x2="358"
            y2="104"
            stroke="#343434"
            strokeWidth="0.9"
            strokeDasharray="4 3"
            markerEnd="url(#arr)"
         />
         <line
            x1="326"
            y1="172"
            x2="358"
            y2="172"
            stroke="#343434"
            strokeWidth="0.9"
            strokeDasharray="4 3"
            markerEnd="url(#arr)"
         />
         <line
            x1="326"
            y1="200"
            x2="358"
            y2="240"
            stroke="#343434"
            strokeWidth="0.9"
            strokeDasharray="4 3"
            markerEnd="url(#arr)"
         />

         {/* GOOGLE */}
         <g className="float">
            <rect
               x="360"
               y="62"
               width="112"
               height="68"
               rx="10"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <image
               href="/google.svg"
               x="372"
               y="75"
               width="26"
               height="26"
               preserveAspectRatio="xMidYMid meet"
            />
            <text x="407" y="85" fontFamily="var(--font-mono)" fontSize="10" fill="#fafafa">
               Google
            </text>
            <text x="407" y="98" fontFamily="var(--font-mono)" fontSize="9" fill="#737373">
               OAuth 2.0
            </text>
         </g>

         {/* GITHUB */}
         <g className="float4">
            <rect
               x="360"
               y="142"
               width="112"
               height="68"
               rx="10"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <image
               href="/github.svg"
               x="372"
               y="155"
               width="26"
               height="26"
               preserveAspectRatio="xMidYMid meet"
            />
            <text x="407" y="165" fontFamily="var(--font-mono)" fontSize="10" fill="#fafafa">
               GitHub
            </text>
            <text x="407" y="178" fontFamily="var(--font-mono)" fontSize="9" fill="#737373">
               OAuth 2.0
            </text>
         </g>

         {/* MICROSOFT */}
         <g className="float5">
            <rect
               x="360"
               y="222"
               width="112"
               height="68"
               rx="10"
               fill="#171717"
               stroke="#282828"
               strokeWidth="1"
            />
            <image
               href="/microsoft.svg"
               x="372"
               y="235"
               width="26"
               height="26"
               preserveAspectRatio="xMidYMid meet"
            />
            <text x="407" y="245" fontFamily="var(--font-mono)" fontSize="10" fill="#fafafa">
               Microsoft
            </text>
            <text x="407" y="258" fontFamily="var(--font-mono)" fontSize="9" fill="#737373">
               OAuth 2.0
            </text>
         </g>

         <text
            x="416"
            y="308"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="#525252"
            textAnchor="middle"
         >
            + more providers
         </text>
      </svg>
   );
}
