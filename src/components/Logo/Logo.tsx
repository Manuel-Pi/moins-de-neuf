import React, { useState, useEffect, CSSProperties } from 'react';

type LogoProps = {
    className?:string
}

export const Logo = ({className}:LogoProps) =>   <div className={"logo " + className}> 
                                                    <svg
                                                        width="100px"
                                                        viewBox="0 -0.3 36 15"
                                                        version="1.1"
                                                        id="svg8">
                                                        <g
                                                            transform="translate(-2.2096816,-1.1675798)"
                                                            id="layer1">
                                                            <g
                                                            style={{fontStyle:"normal",fontWeight:"normal",fontSize:"8.46667px",lineHeight:1.25,fontFamily:"sans-serif",fillOpacity:1,stroke:"none",strokeWidth:0.264583}}
                                                            id="text18"
                                                            aria-label="de">
                                                            <path
                                                                id="path1343"
                                                                style={{fontStyle:"normal",fontVariant:"normal",fontWeight:"normal",fontStretch:"normal",fontSize:"8.46667px",fontFamily:'Arial Unicode MS',fontVariantLigatures:"normal",fontVariantCaps:"normal",fontVariantNumeric:"normal",fontVariantEastAsian:"normal",strokeWidth:0.264583}}
                                                                d="M 6.0172026,15.808747 H 5.3226711 V 15.250642 H 5.3061346 Q 4.9051254,15.9121 4.0948386,15.9121 q -0.8061527,0 -1.3477219,-0.636654 -0.5374351,-0.640788 -0.5374351,-1.65778 0,-1.062468 0.5084963,-1.678451 0.5084963,-0.615984 1.3435877,-0.615984 0.7854821,0 1.1947596,0.599447 h 0.016537 V 9.7481329 H 6.0172026 Z M 4.1733868,15.300251 q 0.4878257,0 0.8268232,-0.401009 0.3389976,-0.40101 0.3389976,-1.21543 0,-0.802019 -0.3100588,-1.277442 -0.3100587,-0.475424 -0.8888349,-0.475424 -0.5787763,0 -0.8764327,0.467155 -0.2935222,0.463021 -0.2935222,1.219565 0,0.545703 0.1570964,0.926042 0.1612305,0.376204 0.4464845,0.566374 0.2852541,0.190169 0.5994469,0.190169 z" />
                                                            <path
                                                                id="path1345"
                                                                style={{fontStyle:"normal",fontVariant:"normal",fontWeight:"normal",fontStretch:"normal",fontSize:"8.46667px",fontFamily:"'Arial Unicode MS'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","strokeWidth":"0.264583"}}
                                                                d="M 10.994679,13.803701 H 7.7080562 q 0.045475,0.727604 0.4134116,1.112077 0.3720705,0.384473 0.9260421,0.384473 0.4258139,0 0.7152021,-0.223242 0.289388,-0.227377 0.44235,-0.682129 l 0.764812,0.09508 q -0.186035,0.686264 -0.682129,1.0542 -0.4960942,0.367936 -1.2402351,0.367936 -0.9880538,0 -1.5461595,-0.603581 -0.5539716,-0.607715 -0.5539716,-1.65778 0,-1.037664 0.5374351,-1.682586 0.5415692,-0.644922 1.5213548,-0.644922 0.4795575,0 0.9219079,0.21084 0.4464844,0.21084 0.7565434,0.719336 0.310059,0.504363 0.310059,1.550294 z M 10.229867,13.191852 Q 10.184392,12.522125 9.8123214,12.228603 9.444385,11.930946 9.0061687,11.930946 q -0.5250328,0 -0.8640303,0.3514 -0.3389975,0.3514 -0.392741,0.909506 z" />
                                                            </g>
                                                            <g
                                                            style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"8.46667px","lineHeight":"1.25","fontFamily":"'Arial Black'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","stroke":"none","strokeWidth":"0.264583"}}
                                                            id="text910"
                                                            aria-label="NEUF">
                                                            <path
                                                                id="path1325"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"8.46667px","fontFamily":"'Arial Black'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","strokeWidth":"0.264583"}}
                                                                d="M 12.603999,9.7552521 H 14.35273 L 16.634763,13.10802 V 9.7552521 h 1.765267 v 6.0606139 h -1.765267 l -2.26963,-3.327963 v 3.327963 h -1.761134 z" />
                                                            <path
                                                                id="path1327"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"8.46667px","fontFamily":"'Arial Black'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","strokeWidth":"0.264583"}}
                                                                d="M 19.648533,9.7552521 H 24.66735 V 11.04923 h -3.141928 v 0.96325 h 2.914552 v 1.2361 h -2.914552 v 1.19476 h 3.232879 v 1.372526 h -5.109768 z" />
                                                            <path
                                                                id="path1329"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"8.46667px","fontFamily":"'Arial Black'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","strokeWidth":"0.264583"}}
                                                                d="m 29.715106,9.7552521 h 1.868621 V 13.36847 q 0,0.537435 -0.169499,1.016992 -0.165365,0.475424 -0.525033,0.835092 -0.355534,0.355534 -0.748275,0.500228 -0.545703,0.202571 -1.310515,0.202571 -0.44235,0 -0.967383,-0.06201 -0.520898,-0.06201 -0.872298,-0.243913 -0.3514,-0.186035 -0.644922,-0.525033 -0.289389,-0.338997 -0.396876,-0.698666 -0.173632,-0.578776 -0.173632,-1.02526 V 9.7552521 h 1.86862 v 3.7000339 q 0,0.496094 0.272852,0.777214 0.276986,0.276986 0.764811,0.276986 0.483692,0 0.756544,-0.272852 0.276985,-0.276986 0.276985,-0.781348 z" />
                                                            <path
                                                                id="path1331"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"8.46667px","fontFamily":"'Arial Black'","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","strokeWidth":"0.264583"}}
                                                                d="m 32.840498,9.7552521 h 4.63021 v 1.3022469 h -2.749187 v 1.058333 h 2.348178 v 1.223699 h -2.348178 v 2.476335 h -1.881023 z" />
                                                            </g>
                                                            <g
                                                            style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","lineHeight":"1.25","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal","whiteSpace":"pre","stroke":"none"}}
                                                            id="text1285"
                                                            transform="translate(-21.717035,-21.996939)"
                                                            aria-label="MOINS">
                                                            <path
                                                                id="path1289"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal"}}
                                                                d="m 24.019489,31.377511 v -8.080824 h 1.60955 l 1.912719,5.721621 q 0.264584,0.799262 0.385851,1.196138 0.137804,-0.440973 0.429948,-1.295357 l 1.934768,-5.622402 h 1.438673 v 8.080824 h -1.030773 v -6.763418 l -2.34818,6.763418 h -0.964628 l -2.337155,-6.879173 v 6.879173 z" />
                                                            <path
                                                                id="path1291"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal"}}
                                                                d="m 33.142111,27.44183 q 0,-2.011938 1.080383,-3.147442 1.080383,-1.141017 2.789152,-1.141017 1.118968,0 2.01745,0.534679 0.898482,0.53468 1.367015,1.493795 0.474046,0.953604 0.474046,2.166279 0,1.229211 -0.496095,2.199351 -0.496094,0.97014 -1.4056,1.471746 -0.909506,0.496094 -1.962328,0.496094 -1.141017,0 -2.039499,-0.551216 -0.898482,-0.551215 -1.361503,-1.504819 -0.463021,-0.953603 -0.463021,-2.01745 z m 1.102431,0.01654 q 0,1.460722 0.782727,2.304082 0.788238,0.837848 1.973352,0.837848 1.207163,0 1.984378,-0.848872 0.782726,-0.848873 0.782726,-2.408814 0,-0.986676 -0.336242,-1.719793 -0.330729,-0.738629 -0.975652,-1.141017 -0.63941,-0.4079 -1.438673,-0.4079 -1.135505,0 -1.956816,0.782727 -0.8158,0.777214 -0.8158,2.601739 z" />
                                                            <path
                                                                id="path1293"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal"}}
                                                                d="m 42.424585,31.377511 v -8.080824 h 1.069359 v 8.080824 z" />
                                                            <path
                                                                id="path1295"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal"}}
                                                                d="m 45.362565,31.377511 v -8.080824 h 1.09692 l 4.244362,6.344494 v -6.344494 h 1.025261 v 8.080824 h -1.096919 l -4.244362,-6.350006 v 6.350006 z" />
                                                            <path
                                                                id="path1297"
                                                                style={{"fontStyle":"normal","fontVariant":"normal","fontWeight":"normal","fontStretch":"normal","fontSize":"11.2889px","fontFamily":"Arial","fontVariantLigatures":"normal","fontVariantCaps":"normal","fontVariantNumeric":"normal","fontVariantEastAsian":"normal"}}
                                                                d="m 53.167782,28.781285 1.008725,-0.08819 q 0.07166,0.606338 0.33073,0.997701 0.264583,0.385851 0.815799,0.628386 0.551216,0.237023 1.240236,0.237023 0.611849,0 1.080383,-0.181902 0.468533,-0.181901 0.694532,-0.496094 0.23151,-0.319705 0.23151,-0.694532 0,-0.380339 -0.220486,-0.661459 -0.220486,-0.286632 -0.727605,-0.479558 -0.325217,-0.126779 -1.438673,-0.391363 -1.113456,-0.270096 -1.559941,-0.507118 -0.578777,-0.303169 -0.865409,-0.749654 -0.28112,-0.451997 -0.28112,-1.008725 0,-0.611849 0.347266,-1.141017 0.347266,-0.534679 1.014237,-0.810287 0.666971,-0.275608 1.482771,-0.275608 0.898482,0 1.581989,0.292145 0.68902,0.286632 1.058335,0.848872 0.369314,0.56224 0.396875,1.273309 l -1.025261,0.07717 q -0.08268,-0.76619 -0.562241,-1.157554 -0.474045,-0.391363 -1.4056,-0.391363 -0.97014,0 -1.416625,0.358291 -0.440972,0.352778 -0.440972,0.854384 0,0.435461 0.314193,0.716581 0.308681,0.28112 1.60955,0.578776 1.306381,0.292145 1.791451,0.512631 0.705557,0.325217 1.041798,0.826824 0.336242,0.496094 0.336242,1.146529 0,0.644922 -0.369315,1.218187 -0.369314,0.567752 -1.063846,0.887457 -0.68902,0.314193 -1.554429,0.314193 -1.096919,0 -1.841061,-0.319705 -0.738629,-0.319705 -1.163065,-0.959115 -0.418924,-0.644923 -0.440973,-1.45521 z" />
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </div>