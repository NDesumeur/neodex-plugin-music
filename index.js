// NeoMusic : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "";
const MU_CSS = `/* NeoMusic: MuPlayer's look (Consolas, flat cards, accent strips); colours are the theme's, set on #mu by muApplyTheme */
#plug_neodex_music{overflow:hidden;background:#101425}
.mu{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--mbg);color:var(--mtext);font:13px Consolas,'Cascadia Mono',monospace;user-select:none;overflow:hidden}
:where(.mu) button{all:unset;box-sizing:border-box;cursor:var(--cp,pointer)}
:where(.mu) :is(input,select){font:inherit;color:inherit}
:where(.mu) button:disabled{cursor:default;opacity:.45}
:where(.mu) :focus-visible{outline:1px solid var(--macc);outline-offset:1px}
.mu ::-webkit-scrollbar{width:8px;height:8px} .mu ::-webkit-scrollbar-track{background:transparent}
.mu ::-webkit-scrollbar-thumb{background:var(--mcard2)} .mu ::-webkit-scrollbar-thumb:hover{background:var(--macc)}
.muTop{height:38px;flex:none;display:flex;align-items:center;background:var(--mside);white-space:nowrap;overflow:hidden}
.muTopStrip{width:5px;align-self:stretch;background:var(--macc)}
.muBrand{margin:0 4px 0 14px;color:var(--mwarn);font-size:15px;letter-spacing:.5px}
.muStatus{margin-left:18px;color:var(--mwarn);font-weight:bold;font-size:12px;overflow:hidden;text-overflow:ellipsis;min-width:0}
.muDl{width:120px;height:4px;margin-left:16px;flex:none} .muDl i{display:block;height:100%;width:0;background:var(--macc);transition:width .2s}
.muInd{margin-left:18px;color:var(--macc2);font-weight:bold;font-size:11px} .muInd:empty{display:none}
.muMenuBtn{margin-left:8px!important;margin-right:2px!important;color:#fff} .muTopBtn{margin-left:auto;width:44px;align-self:stretch;display:grid;place-items:center;color:var(--msub);font-size:15px;font-weight:bold}
.muTopBtn:hover{background:var(--mcard);color:var(--mtext)}
.muBody{flex:1;display:flex;min-height:0}
/* sidebar: 250 px, accent strip on top, toggle column on the right */
.muSide{width:250px;flex:none;display:grid;grid-template-columns:1fr;grid-template-rows:3px 1fr;overflow:hidden;background:var(--mside);transition:width .12s}
.muSideStrip{grid-column:1/-1;background:var(--macc)}
.muSideIn{overflow-y:auto;overflow-x:hidden;padding-bottom:16px;min-width:0}
.muSide.closed{width:0} .muSide.closed .muSideIn{visibility:hidden}
.muSideToggle{display:grid;place-items:center;color:var(--macc);font-size:20px;font-weight:bold} .muSideToggle:hover{background:var(--mcard);color:var(--mtext)}
.muHead{padding:14px 10px 6px 24px;color:var(--msub);font-weight:bold;font-size:12px;letter-spacing:.3px}
#muPlaylists{padding:0 0 0 14px}
.muPlBtn{display:flex;align-items:center;width:100%;margin:1px 0;color:var(--mtext);font-size:13px}
.muPlBtn i{width:3px;align-self:stretch;flex:none}
.muPlBtn .ic{width:16px;margin:0 8px 0 12px;flex:none;display:grid;place-items:center;font-size:12px;color:#fff} .muPlBtn .ic svg{display:block}
.muPlBtn span:last-child{padding:8px 10px 8px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muPlBtn:hover,.muPlBtn.on{background:var(--mcard);color:var(--macc)} .muPlBtn.on i{background:var(--macc)} .muPlBtn:active{background:var(--mpress)}
.muPills{display:flex;gap:8px;margin:6px 0 18px 14px}
.muPill{flex:1;text-align:center;padding:7px 4px;background:var(--mcard2);color:var(--macc2);font-weight:bold;font-size:11px}
.muPill:hover{background:var(--macc);color:#06110C} .muPill.danger{color:var(--mdanger)} .muPill.danger:hover{background:color-mix(in srgb,var(--mdanger) 24%,var(--mcard2));color:var(--mdanger)}
.muExtra>.muSideBtn:first-child{margin-top:0}
.muSideIn>.muExtra:last-child{padding:0 0 0 14px}
.muSideBtn{display:flex;align-items:center;gap:14px;width:100%;margin:2px 0;padding:9px 10px;color:var(--mtext);font-size:13px}
.muSideBtn svg{color:#fff;flex:none;image-rendering:pixelated;margin-right:2px} .muSideBtn:hover{background:var(--mcard);color:var(--macc)} .muSideBtn:active{background:var(--mpress)}
:where(.mu,.mu *,.muLayer,.muLayer *,.muWin,.muWin *,.muMenu,.muMenu *,.muMini,.muMini *){text-align:left}
/* main column: three cards */
.muMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;padding:18px 18px 18px 0;margin-left:0}
.mu .muMain{margin:0;height:auto;overflow:hidden;z-index:auto}  /* NeoDex styles every <main> */
.muCard{background:var(--mcard);border:1px solid var(--mborder);flex:none;animation:muReveal .25s ease-out}
@keyframes muReveal{from{transform:translateY(6px)}}  /* no fade: a hidden window would leave it half-faded */
.muNow{display:flex;align-items:center;gap:18px;padding:18px 20px}
.muCoverWrap{flex:none;width:270px;height:200px;display:grid;place-items:center}
.muCoverWrap.rect{width:130px;height:130px}
.muCoverWrap canvas{width:100%;height:100%}
@media (max-width:900px){.muCoverWrap{width:200px;height:150px}}
.muInfo{flex:1;min-width:0;display:flex;flex-direction:column}
.muKick{color:var(--macc);font-weight:bold;font-size:12px;letter-spacing:.3px} .muKick.alt{color:var(--macc2)}
.muTitle{margin:4px 0 2px;font-size:20px;font-weight:bold;line-height:1.3;height:2.6em;overflow:hidden;word-break:break-word;user-select:text}
.muTime{color:var(--msub);font-size:12px}
.muProgress{width:100%;height:36px;margin:10px 0 14px;cursor:var(--cp,pointer);display:block}
.muSpectrum{height:64px;margin-bottom:10px;display:block;image-rendering:pixelated}  /* drawn at the size of the art pixels, scaled up crisp */
/* NeoMusic's portable player: pixel frame (notched corners, accent top), spinning record, pixel spectrum, pixel buttons */
.muMini{position:fixed;z-index:32;left:0;top:0;width:430px;display:none;grid-template-columns:92px 1fr;gap:14px;padding:12px 14px 10px;
  background:var(--mcard);color:var(--mtext);font:12px Consolas,'Cascadia Mono',monospace;cursor:var(--cg,grab);touch-action:none;user-select:none;
  box-shadow:0 -3px 0 0 var(--macc),0 3px 0 0 var(--mborder),-3px 0 0 0 var(--mborder),3px 0 0 0 var(--mborder),0 -6px 0 -3px var(--macc),9px 9px 0 0 rgba(0,0,0,.45)}
.muMini.on{display:grid;animation:mmIn .2s steps(4)}
@keyframes mmIn{from{transform:translateY(12px);opacity:.3}}
.muMini.drag{cursor:var(--cgg,grabbing)}
.muMini::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(90deg,var(--macc) 0 6px,var(--macc2) 6px 9px);opacity:.55}
#mmDisc{width:92px;height:92px;align-self:center}
.mmBody{min-width:0;display:flex;flex-direction:column;gap:3px}
.mmTop{display:flex;align-items:center;gap:6px;height:20px}
.mmKick{color:var(--macc);font-weight:bold;font-size:10px;letter-spacing:2px} #mmState{flex:1;font-size:10px;font-weight:bold;letter-spacing:1px}
#mmTitle{font-size:13px;line-height:1.3;min-height:1.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mmArtist{color:var(--msub);font-size:11px;line-height:1.3;min-height:1.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mmSpecBox{height:21px;margin-top:2px} .mmSpecBox.sup{height:39px} #mmSpec{display:block;image-rendering:pixelated}
.mmBar{display:flex;align-items:center;gap:8px}
#mmSeek{flex:1;height:6px;background:var(--mcard2);cursor:var(--cp,pointer);box-shadow:0 2px 0 rgba(0,0,0,.35)} #mmSeek:hover{height:8px}
#mmSeek i{display:block;height:100%;width:0;background:repeating-linear-gradient(90deg,var(--macc) 0 4px,color-mix(in srgb,var(--macc) 75%,#fff) 4px 6px)}
#mmTime{color:var(--msub);font-size:10px;white-space:nowrap}
.mmCtl{display:flex;align-items:center;gap:4px;margin-top:3px}
.mmBtn{all:unset;box-sizing:border-box;cursor:var(--cp,pointer);width:30px;height:26px;display:grid;place-items:center;color:var(--mtext);background:var(--mcard2);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 2px 0 rgba(0,0,0,.4);transition:background .1s,color .1s}
.mmBtn:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2));color:var(--macc)} .mmBtn:active{transform:translateY(2px);box-shadow:none}
#mmPlay{width:38px;background:var(--macc);color:#06110C} #mmPlay:hover{background:var(--macc2);color:#06110C}
#mmFav.on{color:var(--mheart)}
.mmTop .mmBtn{width:22px;height:18px;background:transparent;box-shadow:none;color:var(--msub)} .mmTop .mmBtn:hover{background:var(--mcard2);color:var(--mtext)} #mmClose:hover{background:var(--mdanger);color:#fff}
#mmVol{margin-left:auto;color:var(--msub);font-size:10px;letter-spacing:1px}
body.vfs .muMini{display:none}
body.mmFloat>*:not(.muMini){display:none!important} body.mmFloat{overflow:hidden;background:transparent!important} body.mmFloat .muMini{left:0!important;top:0!important}
.mu.novis .muSpectrum{display:none}
.muControls{display:flex;align-items:center;justify-content:center;gap:24px}
.muSkip{width:40px;height:40px} .muSkip{position:relative;color:#fff;display:grid;place-items:center} .muSkip>svg+svg{width:24px!important;height:auto!important;position:absolute!important;inset:auto!important} .muSkip>svg:first-child{width:40px;height:40px;fill:var(--mtext);display:block} .muSkip:hover{color:var(--macc)} .muSkip>svg+svg{fill:none}
.muSkip .halo{fill:transparent;transition:fill .12s} .muSkip:hover .halo{fill:var(--mcard2)} .muSkip:hover>svg:first-child{fill:var(--macc)} .muSkip:active .halo{fill:var(--mpress)}
.muPlay{width:64px;height:64px;border-radius:50%;position:relative} .muPlay>svg{width:64px;height:64px;display:block} .muPlay>span{position:absolute;inset:0!important;display:grid!important;place-items:center;pointer-events:none} .muPlay>span svg{width:28px;height:auto;display:block}
.muPlay .fill{fill:var(--macc);transition:fill .12s} .muPlay:hover .fill{fill:var(--macc2)} .muPlay:active>svg{transform:scale(.95)}
.muNowSide{flex:none;width:150px;align-self:flex-start;display:flex;flex-direction:column;align-items:center}
.muNowSide .muBtn{margin-bottom:10px}
.muSmall{color:var(--msub);font-weight:bold;font-size:11px;margin-top:4px} .muNowSide .muSmall+.muSelect{margin-top:3px} .muNowSide .muRange+.muSmall{margin-top:12px}
.muBtn{display:inline-block;padding:8px 12px;background:var(--mcard2);color:var(--mtext);font-weight:bold;font-size:12px;white-space:nowrap;text-align:center}
.muBtn:hover{background:var(--mcard)} .muBtn:active{background:var(--mpress)} .muBtn.accent{color:var(--macc)} .muBtn.danger{color:var(--mdanger)}
.muRange{-webkit-appearance:none;appearance:none;width:130px;height:14px;background:transparent;margin:4px 0;cursor:var(--cp,pointer)}
.muRange::-webkit-slider-runnable-track{height:6px;background:var(--mcard2)}
.muRange::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:14px;margin-top:-4px;background:var(--macc);border:1px solid var(--mtext)}
.muRange:hover::-webkit-slider-thumb{background:var(--macc2)}
.muSelect{background:var(--mcard2);color:var(--macc);border:0;padding:5px 8px;font-size:11px;outline:none;cursor:var(--cp,pointer);max-width:100%}
.muSelect.sub{color:var(--msub)} .muSelect option{background:var(--mcard2);color:var(--mtext)}
.muNowSide .muSelect{width:130px}
/* recommendation */
.muReco{display:flex;align-items:center;gap:14px;padding:14px 20px}
#muRecoCover{width:54px;height:54px}
.muRecoText{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
#muReco{font-size:13px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
/* framed covers (ArtworkFrame): border, hard shadow, accent corner; "?" when there is none */
.muArt{position:relative;flex:none;background:var(--mcard2);border:2px solid var(--mborder);box-shadow:3px 3px 0 #090B12}
.muArt::before{content:"";position:absolute;left:-2px;top:-2px;width:45%;height:45%;border-top:2px solid var(--macc);border-left:2px solid var(--macc);pointer-events:none;z-index:1}
.muArt.alt::before{border-color:var(--macc2)}
.muArt img{width:100%;height:100%;object-fit:cover;display:block}
.muArt:not(:has(img))::after{content:"?";position:absolute;inset:0;display:grid;place-items:center;color:var(--macc);font-weight:bold;font-size:20px}
.muTile .muArt:not(:has(img))::after{font-size:44px}
.muArt.alt:not(:has(img))::after{color:var(--macc2)}
/* library */
.muLib{flex:1;min-height:120px;display:flex;flex-direction:column}
.muLibHead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:16px 20px 8px}
.muLibHead b{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .muLibHead span{color:var(--msub);font-size:12px;flex:none}
.muFilters{display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 10px}
.muFilter{width:190px;background:var(--mcard2);color:var(--mtext);border:0;padding:6px 8px;font-size:11px;outline:none;caret-color:var(--macc)}
.muFilter::placeholder{color:var(--msub)} .muFilter:focus{outline:1px solid var(--macc)}
.muList{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;margin:0 14px 14px;position:relative;outline:none;background:var(--mcard);overscroll-behavior:contain}
#muSpacer{position:relative;width:100%}
.muRow{position:absolute;left:0;right:0;top:0;height:58px;display:flex;align-items:center;background:var(--mcard);cursor:var(--cp,pointer);backface-visibility:hidden}
.muRow:hover{background:color-mix(in srgb,var(--mcard) 70%,var(--mcard2))}
.muRow .muStrip{width:4px;align-self:stretch;flex:none}
.muRow .muArt{margin:0 12px 0 10px}
.muRowText{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.muRowText b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.muRowText div{display:flex;align-items:baseline;gap:8px}
.muRowText span{flex:1;min-width:0;color:var(--msub);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.muRowText em,.muTile em{font-style:normal;color:var(--macc2);font-weight:bold;font-size:12px;flex:none}
.muRowFav{padding:6px 8px;margin-left:8px;color:var(--msub);font-size:16px;transition:color .13s} .muRowFav.on{color:var(--mheart)} .muRowFav:hover{color:var(--mheart)}
.muRowDel{padding:6px 8px;margin-right:4px;color:var(--msub);font-size:13px;transition:color .13s} .muRowDel:hover{color:var(--mdanger)}
.muRow.sel,.muTile.sel{background:var(--mcard2);box-shadow:inset 0 0 0 1px var(--macc)}
.muRow.sel .muStrip,.muTile.sel .muStrip{background:var(--macc)}
.muRow.playing .muRowText b,.muTile.playing b{color:var(--macc)}
.muRow.playing .muRowText b::before,.muTile.playing b::before{content:"▶ ";font-size:10px}
.muRow.missing,.muTile.missing{opacity:.5}
.muTile{position:absolute;left:0;top:0;width:152px;height:196px;display:flex;flex-direction:column;align-items:center;background:var(--mcard);cursor:var(--cp,pointer);backface-visibility:hidden}
.muTile:hover{background:color-mix(in srgb,var(--mcard) 70%,var(--mcard2))}
.muTile .muStrip{height:3px;width:100%;flex:none}
.muTile .muArt{margin:8px 0 4px}
.muTile b,.muTile>span{width:100%;padding:0 8px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.muTile b,.muTile>span,.muTile em{line-height:1.2} .muTile b{font-size:12px} .muTile>span{color:var(--msub);font-size:11px}
.muTileAct{display:flex;justify-content:space-around;width:100%;margin-top:auto}
.muTileAct .muRowFav,.muTileAct .muRowDel{margin:0;padding:1px 10px 3px}
.mu.mini .muExtra{display:none!important}
.mu.mini .muNow{padding:12px 16px} .mu.mini .muSpectrum{display:none}
/* context menu (Tk Menu colours) */
.muMenu{position:fixed;z-index:60;min-width:210px;padding:3px;background:var(--mcard2);border:1px solid var(--mborder);box-shadow:4px 4px 0 #090B12;display:flex;flex-direction:column;font-size:12px}
.muMenu button{padding:6px 12px;white-space:nowrap;color:var(--mtext)} .muMenu button:hover:not(:disabled){background:var(--macc);color:#17111F}
.muMenu hr{border:0;border-top:1px solid var(--mborder);margin:3px 2px}
/* Appli pixel (settings.pixelUi): the look of the portable player everywhere */
.mu.px{font-family:Consolas,'Cascadia Mono',monospace;letter-spacing:.2px}
.mu.px *{border-radius:0!important;transition-timing-function:steps(3)!important}
.mu.px .muCard,.mu.px .muWin,.mu.px .muMenu{border:0;box-shadow:0 -3px 0 0 var(--macc),0 3px 0 0 var(--mborder),-3px 0 0 0 var(--mborder),3px 0 0 0 var(--mborder),0 -6px 0 -3px var(--macc),9px 9px 0 0 rgba(0,0,0,.45)}
.mu.px .muMain{gap:22px;padding:24px 22px 20px 6px} .mu.px .muWin{margin:8px}
.mu.px .muCard::before{content:"";display:block;height:3px;background:repeating-linear-gradient(90deg,var(--macc) 0 6px,var(--macc2) 6px 9px);opacity:.55}
.mu.px .muBtn,.mu.px .muPill,.mu.px .muSelect,.mu.px .muTopBtn{box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 3px 0 rgba(0,0,0,.45)}
.mu.px .muBtn:hover,.mu.px .muPill:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2));color:var(--mtext)} .mu.px .muBtn:active,.mu.px .muPill:active{transform:translateY(3px);box-shadow:none}
.mu.px .muSideBtn,.mu.px .muPlBtn{box-shadow:none} .mu.px .muSideBtn:active,.mu.px .muPlBtn:active{transform:translateY(2px)}
.mu.px .muRow,.mu.px .muTile{box-shadow:none} .mu.px .muRow.sel,.mu.px .muTile.sel{box-shadow:inset 0 0 0 2px var(--macc)}
.mu.px .muFilter,.mu.px .muArtFilter,.mu.px .muSelect{border:2px solid var(--mborder);box-shadow:inset 0 2px 0 rgba(0,0,0,.35)}
.mu.px .muRange::-webkit-slider-runnable-track{height:8px;background:repeating-linear-gradient(90deg,var(--mcard2) 0 4px,var(--mborder) 4px 6px)}
.mu.px .muRange::-webkit-slider-thumb{width:10px;height:18px;margin-top:-5px;border:2px solid var(--mtext);box-shadow:0 3px 0 rgba(0,0,0,.45)}
.mu.px .muWinBar{background-image:repeating-linear-gradient(90deg,transparent 0 6px,rgba(255,255,255,.035) 6px 9px)}
.mu.px ::-webkit-scrollbar{width:10px;height:10px} .mu.px ::-webkit-scrollbar-track{background:var(--mcard2)} .mu.px ::-webkit-scrollbar-thumb{background:var(--mborder);box-shadow:inset -2px -2px 0 rgba(0,0,0,.4),inset 2px 2px 0 rgba(255,255,255,.15)}
.mu.px .muCheck input[type=checkbox]{-webkit-appearance:none;appearance:none;margin:1px 0 0;width:16px;height:16px;flex:none;cursor:var(--cp,pointer);background:var(--mbg);border:2px solid var(--mborder);display:grid;place-items:center;box-shadow:inset 0 2px 0 rgba(0,0,0,.35)}
.mu.px .muCheck input[type=checkbox]:hover{border-color:var(--macc)} .mu.px .muCheck input[type=checkbox]:checked{background:var(--macc);border-color:var(--macc)}
.mu.px .muCheck input[type=checkbox]:checked::after{content:"";width:8px;height:4px;border-left:3px solid var(--mbg);border-bottom:3px solid var(--mbg);transform:translateY(-1px) rotate(-45deg)}
.mu.px .muTop{height:48px;background:var(--mside);box-shadow:0 3px 0 var(--macc),0 6px 0 rgba(0,0,0,.4);position:relative;z-index:3}
.mu.px .muTopStrip{display:none}
.mu.px .muBrand{margin:0 14px 0 12px;padding:9px 16px;background:var(--macc);color:var(--mbg);font-weight:800;letter-spacing:2px;box-shadow:inset 0 2px 0 rgba(255,255,255,.3),inset 0 -3px 0 rgba(0,0,0,.25);clip-path:polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))}
.mu.px .muStatus{margin-left:0;padding:5px 4px;background:none;box-shadow:none;letter-spacing:1px}
.mu.px .muTopBtn{background:var(--mcard2);margin:8px 12px 8px auto;width:36px;align-self:auto;height:32px}
.mu.px .muSide{background:var(--mside);box-shadow:4px 0 0 rgba(0,0,0,.35);position:relative;z-index:2;grid-template-rows:6px 1fr;background-image:repeating-linear-gradient(0deg,transparent 0 3px,rgba(255,255,255,.025) 3px 4px)}
.mu.px .muSideStrip{background:repeating-linear-gradient(90deg,var(--macc) 0 6px,var(--macc2) 6px 9px)}
.mu.px .muHead{display:flex;align-items:center;gap:8px;padding:18px 12px 8px 14px;color:var(--macc);font-size:11px;letter-spacing:2px;text-transform:uppercase}
.mu.px .muHead::before{content:"";width:8px;height:8px;flex:none;background:var(--macc);box-shadow:3px 3px 0 rgba(0,0,0,.45)}
.mu.px .muHead::after{content:"";flex:1;height:2px;background:repeating-linear-gradient(90deg,var(--mborder) 0 4px,transparent 4px 7px)}
.mu.px #muPlaylists{padding:0 12px 0 12px;display:flex;flex-direction:column;gap:7px}
.mu.px .muPlBtn{margin:0;background:var(--mcard);border:2px solid var(--mborder);box-shadow:inset 0 2px 0 rgba(255,255,255,.06),0 3px 0 rgba(0,0,0,.45);position:relative}
.mu.px .muPlBtn i{display:none}
.mu.px .muPlBtn:hover:not(.on){border-color:var(--macc);color:var(--macc);background:var(--mcard)}
.mu.px .muPlBtn.on{background:var(--macc);border-color:var(--macc);color:var(--mbg);font-weight:700}
.mu.px .muPlBtn.on .ic{color:var(--mbg)}
.mu.px .muPlBtn.on::after{content:"";position:absolute;right:-12px;top:50%;margin-top:-6px;border-left:8px solid var(--macc);border-top:6px solid transparent;border-bottom:6px solid transparent}
.mu.px .muPlBtn:active{transform:translateY(3px);box-shadow:none}
.mu.px .muPills{margin:12px 12px 8px}
.mu.px .muSideIn>.muExtra:last-child{padding:0 12px}
.mu.px .muSideBtn{margin:0 0 6px;padding:5px 8px;gap:12px;background:transparent;border:2px solid transparent;box-shadow:none}
.mu.px .muSideBtn svg{padding:5px;box-sizing:content-box;background:var(--mcard2);border:2px solid var(--mborder);box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 3px 0 rgba(0,0,0,.45);margin:0 0 3px}
.mu.px .muSideBtn:hover{background:var(--mcard);border-color:var(--mborder);color:var(--macc)} .mu.px .muSideBtn:hover svg{border-color:var(--macc);background:color-mix(in srgb,var(--macc) 24%,var(--mcard2))}
.mu.px .muSideBtn:active svg{transform:translateY(3px);box-shadow:none}
.mu.px .muSide:not(.closed){width:276px} .mu.px .muSideBtn span{white-space:nowrap;font-size:12.5px} .mu.px .muSideBtn svg{padding:4px}

.mu.px .muWinBar{height:40px;background:var(--mside);box-shadow:0 3px 0 var(--macc)} .mu.px .muWinBar i{display:none}
.mu.px .muWinBar b{flex:none;margin:0 12px;padding:5px 12px;background:var(--macc);color:var(--mbg);letter-spacing:2px;text-transform:uppercase;clip-path:polygon(0 3px,3px 3px,3px 0,calc(100% - 3px) 0,calc(100% - 3px) 3px,100% 3px,100% calc(100% - 3px),calc(100% - 3px) calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,3px calc(100% - 3px),0 calc(100% - 3px))}
.mu.px .muWinBar::after{content:"";flex:1;order:1;height:2px;margin:0 8px;background:repeating-linear-gradient(90deg,var(--mborder) 0 4px,transparent 4px 7px)} .mu.px .muWinBar button{order:2}
.mu.px .muWH{display:flex;align-items:center;gap:10px;letter-spacing:2px;text-transform:uppercase} .mu.px .muWH::after{content:"";flex:1;height:2px;background:repeating-linear-gradient(90deg,var(--macc) 0 4px,transparent 4px 7px);opacity:.6}
.mu.px .muWSec{display:flex;align-items:center;gap:8px;letter-spacing:2px} .mu.px .muWSec::before{content:"";width:7px;height:7px;background:var(--macc2);box-shadow:2px 2px 0 rgba(0,0,0,.45)}
.mu.px .muWRow,.mu.px .muArtRow,.mu.px .muTrashList button{box-shadow:none} .mu.px .muArtList{border:2px solid var(--mborder)} .mu.px .muArtHead{border-left-width:6px}
.mu.px .muMenu{padding:4px} .mu.px .muMenu button{padding:7px 12px;border-left:3px solid transparent} .mu.px .muMenu button:hover:not(:disabled){background:color-mix(in srgb,var(--macc) 24%,var(--mcard2));color:var(--mtext);border-left-color:var(--macc)}
.mu.px .muMode{border:2px solid transparent;box-shadow:0 3px 0 rgba(0,0,0,.35)} .mu.px .muMode:hover{border-color:var(--macc)}
/* secondary windows: borderless, title bar with accent strip, top-left like MuPlayer's, draggable */
.muLayer{position:absolute;inset:0;pointer-events:none;z-index:20}
.muWin{position:absolute;left:0;top:38px;max-width:100%;max-height:calc(100% - 38px);display:flex;flex-direction:column;background:var(--mcard);border:1px solid var(--mborder);box-shadow:6px 6px 0 rgba(0,0,0,.35);pointer-events:auto;animation:muReveal .18s ease-out}
.muWinBar{height:34px;flex:none;display:flex;align-items:center;background:var(--mside);cursor:move}
.muWinBar i{width:4px;align-self:stretch;background:var(--macc)} .muWinBar b{flex:1;padding:0 12px;color:var(--mwarn);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muWinBar button,.muDlgBar button{width:42px;align-self:stretch;display:grid;place-items:center;color:var(--mdanger);font-weight:bold;font-size:12px}
.muWinBar button:hover,.muDlgBar button:hover{background:var(--mdanger);color:var(--mtext)}
.muWinBody{overflow-y:auto;padding:4px 30px 22px;user-select:text}
.muWHx{display:none} .muWH{margin:20px 0 8px;color:var(--macc);font-weight:bold;font-size:17px}
.muWHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px} .muWHead>span{color:var(--msub);font-size:12px}
.muWSec{margin:22px 0 8px;color:var(--macc2);font-weight:bold;font-size:12px;letter-spacing:.3px}
.muWNote{margin:4px 0;color:var(--msub);font-size:12px;line-height:1.45} .muWNote.ind{padding-left:24px}
.muWEnd{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}
.muWBtns{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0}
.muWBtns>span{color:var(--msub);font-size:12px}
.muRows{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.muWRow{display:flex;align-items:center;gap:12px;padding:8px 10px;background:var(--mcard2)}
.muWRow>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.muWRow b{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .muWRow span{color:var(--msub);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.muWThumb{width:72px;height:40px;object-fit:cover;flex:none;border:1px solid var(--mborder)}
.muWin label.muCheck{display:flex;align-items:flex-start;gap:10px;margin:7px 0;cursor:var(--cp,pointer);font-size:12px;line-height:1.4}
.muWin label.muCheck input{accent-color:var(--macc);margin:1px 0 0;width:14px;height:14px;flex:none;cursor:inherit}
.muArtRow input[type=checkbox]{-webkit-appearance:none;appearance:none;margin:1px 0 0;width:16px;height:16px;flex:none;cursor:var(--cp,pointer);background:var(--mbg);border:2px solid var(--mborder);display:grid;place-items:center;transition:background .12s,border-color .12s,box-shadow .12s}
.muArtRow input[type=checkbox]:hover{border-color:var(--macc)}
.muArtRow input[type=checkbox]:checked{background:var(--macc);border-color:var(--macc);box-shadow:0 0 8px color-mix(in srgb,var(--macc) 60%,transparent)}
.muArtRow input[type=checkbox]:checked::after{content:"";width:8px;height:4px;border-left:3px solid var(--mbg);border-bottom:3px solid var(--mbg);transform:translateY(-1px) rotate(-45deg)}
.muArtHead .ph{width:72px;height:72px;flex:none;border-radius:50%;object-fit:cover;border:3px solid var(--macc);box-shadow:0 0 0 3px var(--mcard),0 0 18px color-mix(in srgb,var(--macc) 45%,transparent)}
.muArtHead .ic{width:72px;height:72px;font-size:30px}
.muRadios{display:flex;flex-wrap:wrap;gap:4px 18px;padding-left:24px}
.muBands{display:flex;justify-content:space-between;gap:6px;padding:12px 10px;background:var(--mcard2);margin:8px 0}
.muBand{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1}
.muBand span{color:var(--macc);font-size:10px;font-weight:bold} .muBand b{color:var(--msub);font-size:10px}
.muBand input{writing-mode:vertical-lr;direction:rtl;width:18px;height:120px;accent-color:var(--macc);cursor:var(--cp,pointer)}
.muThemes{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}
.muTh{display:flex;flex-direction:column;gap:0;padding:0;border:2px solid transparent;background:none;cursor:pointer;font:inherit;text-align:left;overflow:hidden;transition:transform .12s,border-color .12s}
.muTh:hover{transform:translateY(-2px)} .muTh.on{transform:translateY(-1px)}
.muTh .pv{display:grid;grid-template-columns:22% 1fr;height:58px} .muTh .pv i{display:block} .muTh .pv .sd{display:flex;flex-direction:column;gap:5px;padding:7px 5px} .muTh .pv .sd u{display:block;height:4px;border-radius:2px;opacity:.7}
.muTh .pv .mn{display:flex;flex-direction:column;gap:5px;padding:7px} .muTh .pv .mn u{display:block;height:9px} .muTh .pv .mn s{display:block;height:4px;width:60%} .muTh .pv .mn em{display:block;height:5px;width:35%;margin-top:auto}
.muTh .nm{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 8px;font-size:11px;font-weight:600} .muTh .nm span{display:flex;gap:3px} .muTh .nm span u{display:block;width:8px;height:8px;border-radius:50%}
.muTh.locked{opacity:.45;cursor:default}
.muArtHead{display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:10px;background:linear-gradient(135deg,var(--mcard2),var(--mcard));border-left:4px solid var(--macc)}
.muArtHead .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--macc);color:var(--mbg);font-size:22px;font-weight:800;flex:none}
.muArtHead b{display:block;font-size:19px} .muArtHead span{color:var(--msub);font-size:12px}
.muArtTools{display:flex;gap:8px;margin-bottom:8px} .muArtFilter{flex:1;padding:9px 12px;background:var(--mcard2);border:1px solid var(--mborder);color:var(--mtext);font:inherit;outline:none} .muArtFilter:focus{border-color:var(--macc)}
.muArtList{display:flex;flex-direction:column;max-height:46vh;overflow-y:auto;border:1px solid var(--mborder)}
.muArtRow{display:grid;grid-template-columns:30px 22px 1fr auto;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid color-mix(in srgb,var(--mborder) 40%,transparent)}
.muArtRow:nth-child(even){background:color-mix(in srgb,var(--mcard2) 55%,transparent)} .muArtRow:hover{background:color-mix(in srgb,var(--macc) 14%,var(--mcard2))} .muArtRow.on{background:color-mix(in srgb,var(--macc) 22%,var(--mcard2))}
.muArtRow .n{color:var(--msub);font-size:11px;text-align:right}  .muArtRow div{min-width:0} .muArtRow b{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .muArtRow small{color:var(--msub);font-size:11px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .muArtRow .d{color:var(--msub);font-size:12px;font-variant-numeric:tabular-nums}
.muSwatch{padding:8px 14px;border:2px solid transparent;font-weight:bold;font-size:12px}
.muSwatch:hover{filter:brightness(1.2)} .muSwatch.locked{display:flex;align-items:center;gap:8px;background:var(--mcard2);color:var(--msub)}
.muKeyRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:3px 0;font-size:12px}
.muKey{width:220px;flex:none;background:var(--mcard2);color:var(--macc);border:0;padding:6px 8px;text-align:center;font-size:12px;outline:none;cursor:var(--cp,pointer)}
.muKey:focus{outline:1px solid var(--macc);color:var(--mwarn)}
.muLevel{height:10px;background:var(--mcard2);margin:6px 0} .muLevel i{display:block;height:100%;background:linear-gradient(90deg,var(--macc),var(--macc2))}
.muStats{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-bottom:10px}
.muStat{background:var(--mcard2);padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.muStat b{font-size:20px} .muStat span{color:var(--msub);font-size:11px}
.muChart{display:flex;align-items:flex-end;gap:6px;height:112px;padding:8px 10px 0;background:var(--mcard2)}
.muChart>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%}
.muChart i{display:block;width:100%;max-width:26px} .muChart span{color:var(--msub);font-size:10px;padding-bottom:4px}
.muBarRow{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;margin:7px 0;font-size:12px}
.muBarRow>b{color:var(--msub)} .muBarRow>div{min-width:0;display:flex;flex-direction:column;gap:4px}
.muBarRow span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muBarRow>div>i{display:block;height:6px;background:var(--mcard2)} .muBarRow>div>i>i{display:block;height:100%}
.muBarRow em{font-style:normal;color:var(--macc2);font-size:11px;font-weight:bold}
.muRecent{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--mcard2);font-size:12px}
.muRecent span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .muRecent em{font-style:normal;color:var(--msub);flex:none}
.muRecent.total{border:0;font-weight:bold} .muRecent.total em{color:var(--macc)}
.muAchCount{color:var(--macc2);font-size:16px}
.muAch{display:flex;align-items:center;gap:16px;margin:6px 0;padding:10px 14px;background:var(--mcard2);border-left:3px solid var(--mborder)}
.muAch.on{border-left-color:var(--macc)}
.muAch>b{width:190px;flex:none;color:var(--macc);font-size:13px} .muAch .muLock{width:190px;flex:none;color:var(--msub);display:flex}
.muAch p{margin:0;font-size:12px} .muAch:not(.on) p{color:var(--msub)} .muAch em{font-style:normal;color:var(--msub);font-size:11px}
.muTrashList{display:flex;flex-direction:column;gap:3px;max-height:380px;overflow-y:auto;margin:8px 0}
.muTrashList button{padding:8px 10px;background:var(--mcard2);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muTrashList button:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2))} .muTrashList button.on{background:var(--macc);color:#06110C}
div.muCheck{margin:12px 0;padding:10px 14px;background:var(--mcard2)} div.muCheck b{font-size:13px}
div.muCheck pre,.muLogs{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font:11px/1.5 Consolas,monospace;color:var(--msub)}
.muLogs{background:var(--mbg);padding:12px;max-height:420px;overflow-y:auto}
.muImpStatus{display:block;margin-top:12px;font-size:15px;color:var(--mtext)}
.muImpBar{height:6px;background:var(--mcard2);margin:12px 0 4px} .muImpBar i{display:block;height:100%;width:0;background:var(--macc2);transition:width .25s}
/* small modal dialogs (ModernDialog / NotifyDialog / mode) */
.muShade{position:absolute;inset:0;z-index:40;background:rgba(3,4,10,.55);display:grid;place-items:center}
.muDlg{width:440px;max-width:calc(100% - 32px);background:var(--mbg);box-shadow:8px 8px 0 rgba(0,0,0,.4);animation:muReveal .15s ease-out}
.muDlgBar{height:34px;display:flex;align-items:center;background:var(--mcard2)}
.muDlgBar b{flex:1;padding:0 12px;color:var(--macc);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.muDlgCard{margin:6px;padding:18px 22px;background:var(--mcard);border:1px solid var(--macc);border-radius:18px;display:flex;flex-direction:column;gap:6px}
.muDlgTitle{font-size:17px} .muDlgTitle.small{font-size:13px;margin-bottom:6px}
.muDlgCard p{margin:0 0 6px;color:var(--msub);font-size:13px;line-height:1.4}
.muDlgIn{background:var(--mbg);color:var(--mtext);border:0;padding:8px 10px;font-size:15px;outline:none;caret-color:var(--macc);width:100%}
.muDlgIn:focus{outline:1px solid var(--macc)}
.muDlgBtns{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}
.muDlgMsg{margin:0;white-space:pre-wrap;word-break:break-word;font:13px/1.5 Consolas,monospace;color:var(--mtext);max-height:50vh;overflow:auto;user-select:text}
.muMode{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--mcard2);margin-top:4px}
.muMode b{color:var(--macc);font-size:13px} .muMode.alt b{color:var(--macc2)} .muMode span{color:var(--msub);font-size:12px;line-height:1.4;white-space:normal}
.muMode:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2))}
/* buttons: soft relief (light top edge, dark base), rounded, a glow of the accent on hover, pressed on click */
.muBtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:7px;letter-spacing:.4px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--mcard2) 88%,#fff),var(--mcard2));border:1px solid color-mix(in srgb,var(--mborder) 75%,transparent);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 2px 0 rgba(0,0,0,.35);transition:background .14s,border-color .14s,box-shadow .14s,transform .08s,color .14s}
.muBtn:hover,.muCard .muBtn:hover,.muWRow .muBtn:hover{background:linear-gradient(180deg,color-mix(in srgb,var(--mcard2) 80%,#fff),color-mix(in srgb,var(--mcard2) 92%,#fff));border-color:var(--macc);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 2px 0 rgba(0,0,0,.35),0 0 0 3px color-mix(in srgb,var(--macc) 20%,transparent)}
.muBtn:active:not(:disabled){transform:translateY(2px);box-shadow:inset 0 2px 4px rgba(0,0,0,.35);background:var(--mpress)}
.muBtn.accent{background:linear-gradient(180deg,color-mix(in srgb,var(--macc) 26%,var(--mcard2)),color-mix(in srgb,var(--macc) 14%,var(--mcard2)));border-color:color-mix(in srgb,var(--macc) 55%,transparent)}
.muBtn.accent:hover{background:linear-gradient(180deg,color-mix(in srgb,var(--macc) 85%,#fff),var(--macc));color:#06110C;border-color:var(--macc)}
.muBtn.danger{background:linear-gradient(180deg,color-mix(in srgb,var(--mdanger) 22%,var(--mcard2)),color-mix(in srgb,var(--mdanger) 12%,var(--mcard2)));border-color:color-mix(in srgb,var(--mdanger) 50%,transparent)}
.muBtn.danger:hover{background:linear-gradient(180deg,color-mix(in srgb,var(--mdanger) 85%,#fff),var(--mdanger));color:#2A0A0E;border-color:var(--mdanger);box-shadow:0 2px 0 rgba(0,0,0,.35),0 0 0 3px color-mix(in srgb,var(--mdanger) 22%,transparent)}
.muPill{border-radius:7px;padding:8px 4px;letter-spacing:.3px;background:color-mix(in srgb,var(--macc2) 12%,var(--mcard2));border:1px solid color-mix(in srgb,var(--macc2) 40%,transparent);box-shadow:0 2px 0 rgba(0,0,0,.3);transition:background .14s,color .14s,transform .08s}
.muPill.danger{background:color-mix(in srgb,var(--mdanger) 12%,var(--mcard2));border-color:color-mix(in srgb,var(--mdanger) 40%,transparent)}
.muPill:hover{background:var(--macc2);color:#06110C} .muPill.danger:hover{background:var(--mdanger);color:#2A0A0E} .muPill:active{transform:translateY(2px);box-shadow:none}
.muSideBtn{border-radius:7px;transition:background .12s,color .12s,box-shadow .12s}
.muSideBtn:hover{box-shadow:inset 3px 0 0 var(--macc)} .muSideBtn svg{transition:transform .15s} .muSideBtn:hover svg{transform:scale(1.15);color:var(--macc)}
.muPlBtn{border-radius:0 7px 7px 0;transition:background .12s,color .12s}
.muPlay svg{filter:drop-shadow(0 0 8px color-mix(in srgb,var(--macc) 45%,transparent));transition:filter .15s,transform .1s}
.muPlay:hover svg{filter:drop-shadow(0 0 14px color-mix(in srgb,var(--macc2) 60%,transparent));transform:scale(1.05)} .muPlay:active svg{transform:scale(.95)}
.muSkip svg{transition:transform .1s} .muSkip:active svg{transform:scale(.9)}
.muRowDur{flex:none;align-self:center;min-width:44px;text-align:right;margin-left:8px;font-variant-numeric:tabular-nums} .muRowFav,.muRowDel{border-radius:50%;width:30px;height:30px;padding:0;display:grid;place-items:center}
.mu.px .muRowFav,.mu.px .muRowDel{border-radius:0;width:32px;height:30px;background:var(--mcard2);box-shadow:inset 0 2px 0 rgba(255,255,255,.08);margin:0 4px 0 6px} .mu.px .muRowFav:hover,.mu.px .muRowDel:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2))} .mu.px .muRowFav:active,.mu.px .muRowDel:active{transform:translateY(2px);box-shadow:none} .mu.px .muRowFav{color:var(--mborder)} .mu.px .muRowFav.on{color:var(--mheart)} .mu.px .muRowDel:hover{color:var(--mdanger)} .muRowFav:hover,.muRowDel:hover{background:var(--mcard2)}
.muTopBtn{border-radius:6px;margin:5px 6px 5px auto;width:36px}
.muSelect,.muFilter,.muKey,.muDlgIn{border-radius:6px;border:1px solid color-mix(in srgb,var(--mborder) 60%,transparent);transition:border-color .12s}
.muSelect:hover,.muFilter:hover,.muKey:hover{border-color:var(--mborder)}
.muFilter:focus,.muKey:focus,.muDlgIn:focus{outline:0;border-color:var(--macc);box-shadow:0 0 0 3px color-mix(in srgb,var(--macc) 18%,transparent)}
.muSwatch{border-radius:7px;box-shadow:0 2px 0 rgba(0,0,0,.35);transition:transform .1s,filter .12s} .muSwatch:hover{transform:translateY(-1px)}
.muMode{border-radius:9px;border:1px solid transparent;transition:border-color .12s,background .12s} .muMode:hover{border-color:var(--macc)} .muMode.alt:hover{border-color:var(--macc2)}
.muTrashList button{border-radius:6px} .muMenu{border-radius:8px} .muMenu button{border-radius:5px}
.muWinBar button,.muDlgBar button{transition:background .12s,color .12s}
@media (max-width:900px){.muNowSide{display:none}.muSide{width:200px}}`;
export default async function (ctx) {
  const view = ctx.view;
  // le côté système de NeoMusic (yt-dlp, fichiers, raccourcis globaux) vit dans le main.js du plugin : « neo.musicXxx » y est redirigé
  const MU_ID = 'neodex.music', MU_EV = { onMusicHotkey: 'music:hotkey', onMusicProgress: 'music:progress' };
  const MU_DOC = cb => ctx.neo.onPluginDataChanged(e => { if (e.id === MU_ID && e.name === 'library') cb('music'); });  // un autre PC a changé la bibliothèque
  const neo = new Proxy({}, { get: (_, k) => { const n = ctx.neo;  // cible vide : contextBridge fige les propriétés de neo
    if (typeof k !== 'string') return n[k];
    if (k === 'onDataChanged') return cb => { n.onDataChanged?.(cb); MU_DOC(cb); };
    if (MU_EV[k]) return cb => n.onPluginMain(e => { if (e.id === MU_ID && e.name === MU_EV[k]) cb(e.data); });
    const m = /^music([A-Z]\w*)$/.exec(k);
    return m ? (...a) => n.pluginMain(MU_ID, 'music:' + (m[1] === 'ImportMuPlayer' ? 'pickMuPlayer' : m[1][0].toLowerCase() + m[1].slice(1)), ...a) : n[k];
  } });
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = ctx.host;
  const host = ctx.host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  if (!document.getElementById('muStyle')) { const st = document.createElement('style'); st.id = 'muStyle'; st.textContent = MU_CSS; document.head.append(st); }  // le style de NeoMusic vit dans le plugin
  view.innerHTML = HTML;
  const $ = id => id === "musicApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue, sans toucher à ceux du reste de NeoDex
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  // ---- ton code d'origine ----
  /* NeoMusic: MuPlayer (NDesumeur) rebuilt inside NeoDex. Same layout, themes, vinyl, spectrum, waveform, playlists online / offline,
     imports, recommendations, stats, achievements, levels. The whole library lives in music.json (synced between PCs and in the backups);
     music files and covers are a cache on each PC (music-main.js), fetched again from their URL when a PC does not have them. Part 2: music2.js. */

  const MU_THEMES = {
    'Nova': {BG: '#101425', SIDEBAR: '#171B2E', CARD: '#202642', CARD_ALT: '#2B3154', BORDER: '#59658F', TEXT: '#F7F1FF', SUBTEXT: '#A6ADD1', ACCENT: '#C084FC', ACCENT_2: '#7DE2D1', DANGER: '#FF78A8', WARN: '#FFD166', HEART: '#FF8BD4'},
    'Onyx': {BG: '#0A0A0C', SIDEBAR: '#121214', CARD: '#1B1B1F', CARD_ALT: '#26262C', BORDER: '#4A4A54', TEXT: '#F5F5F7', SUBTEXT: '#9A9AA4', ACCENT: '#39FF88', ACCENT_2: '#FF3EA5', DANGER: '#FF4D4D', WARN: '#FFD166', HEART: '#FF6FA8'},
    'Grenat': {BG: '#14161C', SIDEBAR: '#1A1D24', CARD: '#20232C', CARD_ALT: '#2A2E38', BORDER: '#454A56', TEXT: '#F0F1F3', SUBTEXT: '#9CA1AD', ACCENT: '#6FA8FF', ACCENT_2: '#A9C6FF', DANGER: '#FF6B6B', WARN: '#FFD166', HEART: '#8FB8FF'},
    'Aube': {BG: '#0B1130', SIDEBAR: '#111A42', CARD: '#182458', CARD_ALT: '#22317A', BORDER: '#5A6FBE', TEXT: '#FFF6F0', SUBTEXT: '#B7C0EF', ACCENT: '#FF8B6B', ACCENT_2: '#FFD66B', DANGER: '#FF5C6C', WARN: '#FFD166', HEART: '#FFA6C0'},
    'Ambre': {BG: '#191310', SIDEBAR: '#211A15', CARD: '#2B221B', CARD_ALT: '#3A2F25', BORDER: '#6B5640', TEXT: '#F5ECE0', SUBTEXT: '#C2AB8F', ACCENT: '#E0A65C', ACCENT_2: '#4FBFAE', DANGER: '#E8756B', WARN: '#E0BE7F', HEART: '#FF9E7A'},
    'Abyme': {BG: '#030A12', SIDEBAR: '#061019', CARD: '#0B1A29', CARD_ALT: '#12283D', BORDER: '#1F5C7A', TEXT: '#E7FBFF', SUBTEXT: '#7FC4D9', ACCENT: '#29DDBF', ACCENT_2: '#FF8F6B', DANGER: '#FF5D7A', WARN: '#FFD166', HEART: '#FFA487'},
    'Sakura': {BG: '#1A0E1E', SIDEBAR: '#22132A', CARD: '#2E1A38', CARD_ALT: '#3F2249', BORDER: '#7A3E86', TEXT: '#FFF0F8', SUBTEXT: '#DCA9D0', ACCENT: '#FF6FC4', ACCENT_2: '#7FE0B0', DANGER: '#FF5477', WARN: '#FFD166', HEART: '#FFA0D6'},
    'Crépuscule': {BG: '#160B22', SIDEBAR: '#1F1030', CARD: '#2A1640', CARD_ALT: '#3A2058', BORDER: '#8A4A9A', TEXT: '#FFF1E6', SUBTEXT: '#D2A9C2', ACCENT: '#FF7A59', ACCENT_2: '#FFC857', DANGER: '#FF4D6D', WARN: '#FFC857', HEART: '#FF9EC0'},
    'Menthe': {BG: '#07161A', SIDEBAR: '#0C2126', CARD: '#122E34', CARD_ALT: '#1B4048', BORDER: '#2F7F80', TEXT: '#EAFFF8', SUBTEXT: '#8FD1C2', ACCENT: '#3DF2B5', ACCENT_2: '#7AD7FF', DANGER: '#FF6B7A', WARN: '#FFE07A', HEART: '#7DF0D0'},
    'Rubis': {BG: '#16060C', SIDEBAR: '#200A12', CARD: '#2E1019', CARD_ALT: '#421826', BORDER: '#96304A', TEXT: '#FFEFF2', SUBTEXT: '#D79AA8', ACCENT: '#FF3D63', ACCENT_2: '#FFB84D', DANGER: '#FF3D63', WARN: '#FFC857', HEART: '#FF7C98'},
    'Glacier': {BG: '#0A1420', SIDEBAR: '#101D2E', CARD: '#172A40', CARD_ALT: '#223C58', BORDER: '#5F8FB8', TEXT: '#F2FAFF', SUBTEXT: '#9DBBD6', ACCENT: '#7CD4FF', ACCENT_2: '#C8F1FF', DANGER: '#FF7B8A', WARN: '#FFE08A', HEART: '#A8E4FF'},
    'Cuivre': {BG: '#170D08', SIDEBAR: '#20130C', CARD: '#2D1B11', CARD_ALT: '#40271A', BORDER: '#9A5A34', TEXT: '#FFF0E4', SUBTEXT: '#CFA68A', ACCENT: '#E8793A', ACCENT_2: '#5FD3B8', DANGER: '#E5585A', WARN: '#F2C14E', HEART: '#FF9A6A'},
    'Lavande': {BG: '#13102A', SIDEBAR: '#1B1738', CARD: '#251F4A', CARD_ALT: '#352C66', BORDER: '#7E6FC8', TEXT: '#F5F1FF', SUBTEXT: '#B9B0E6', ACCENT: '#B79CFF', ACCENT_2: '#FFB3E6', DANGER: '#FF6F91', WARN: '#FFD98A', HEART: '#FFA8E0'},
    'Forêt': {BG: '#08140C', SIDEBAR: '#0E1E13', CARD: '#15291B', CARD_ALT: '#1F3B28', BORDER: '#3F8A55', TEXT: '#EEFBEF', SUBTEXT: '#98C9A2', ACCENT: '#6BE585', ACCENT_2: '#E6D36A', DANGER: '#F0645A', WARN: '#E6D36A', HEART: '#B5F08F'},
    'Océan': {BG: '#04101F', SIDEBAR: '#071A30', CARD: '#0B2642', CARD_ALT: '#123A5E', BORDER: '#2A78B5', TEXT: '#EAF6FF', SUBTEXT: '#8DB9DE', ACCENT: '#2BA8FF', ACCENT_2: '#2EE6C9', DANGER: '#FF6B81', WARN: '#FFD36B', HEART: '#6FD8FF'},
    'Soleil': {BG: '#1C1405', SIDEBAR: '#271C07', CARD: '#352709', CARD_ALT: '#4A360E', BORDER: '#B8861C', TEXT: '#FFF8E0', SUBTEXT: '#DCC27A', ACCENT: '#FFC93C', ACCENT_2: '#FF7A3C', DANGER: '#F25C54', WARN: '#FFD65A', HEART: '#FFB05A'},
    'Cyber': {BG: '#0C0C0F', SIDEBAR: '#131318', CARD: '#1C1C24', CARD_ALT: '#2A2A36', BORDER: '#FFE600', TEXT: '#F8F8F2', SUBTEXT: '#A6A6B8', ACCENT: '#FFE600', ACCENT_2: '#00F0FF', DANGER: '#FF2E63', WARN: '#FFE600', HEART: '#FF2E93'},
    'Néon': {BG: '#05010D', SIDEBAR: '#0B0316', CARD: '#140626', CARD_ALT: '#1E0A38', BORDER: '#4B3480', TEXT: '#F3ECFF', SUBTEXT: '#B39DDB', ACCENT: '#9C82F2', ACCENT_2: '#B8DE6E', DANGER: '#FF3B5C', WARN: '#FFD166', HEART: '#FF6FB8'},
  };
  const MU_THEME_LEVEL = {Onyx: 3, Grenat: 6, Aube: 10, Ambre: 16, Abyme: 24, Sakura: 35, 'Néon': 50};
  const MU_BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const MU_PRESETS = {
    'Normal': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'Bass boost': [3, 5, 6, 3, 1, 0, 0, 0, 0, 0], 'Bass extreme': [4, 8, 7, 3, 1, 0, 0, 0, 0, 0], 'Treble': [0, 0, 0, 0, 0, 0, 1, 2, 5, 6],
    'Rock': [0, 2, 4, 1, -1, -2, 0, 3, 2, 0], 'Electronic': [3, 5, 3, 1, 0, 0, 0, 1, 4, 5], 'Vocal': [0, 0, 0, -2, -3, -1, 3, 2, 0, 0], 'Custom': null,
  };
  const MU_SYSTEM = ['Favoris', 'Radar des sorties', 'Découvertes de la semaine'];
  const MU_SHORTCUTS = [  // [setting, label, action, default]
    ['play', 'Lecture / pause', 'toggle', 'Ctrl+Alt+Space'], ['previous', 'Morceau précédent', 'prev', 'Ctrl+Alt+Left'], ['next', 'Morceau suivant', 'next', 'Ctrl+Alt+Right'],
    ['volumeUp', 'Volume +', 'volUp', 'Ctrl+Alt+Up'], ['volumeDown', 'Volume -', 'volDown', 'Ctrl+Alt+Down'], ['mute', 'Muet / rétablir le son', 'mute', 'Ctrl+Alt+M'],
    ['seekForward', 'Avancer de 10 s', 'fwd', 'Ctrl+Alt+Shift+Right'], ['seekBackward', 'Reculer de 10 s', 'back', 'Ctrl+Alt+Shift+Left'], ['shuffle', 'Lecture aléatoire', 'shuffle', 'Ctrl+Alt+S'],
    ['favorite', 'Favori (morceau en cours)', 'fav', 'Ctrl+Alt+F'], ['fullscreen', 'Plein écran', 'fullscreen', 'F11'], ['mini', 'Mode petit lecteur', 'mini', 'Ctrl+Alt+P'],
  ];
  const MU_ACHIEVEMENTS = [
    ['first_play', 'Premier pas', 'Écoute ta toute première musique.'], ['hundred_plays', 'Centurion', 'Écoute 100 morceaux au total (lectures cumulées).'],
    ['five_hundred_unique', '500 nuances de son', 'Écoute 500 morceaux différents.'], ['thousand_plays', 'Millénaire sonore', 'Atteins 1000 lectures au total.'],
    ['marathon', 'Marathonien', 'Cumule 24h de temps d\'écoute réel.'], ['full_week', 'Semaine complète', 'Cumule 168h (une semaine) de temps d\'écoute réel.'],
    ['insomniac', 'Insomniaque mélomane', 'Écoute une musique entre 2h et 5h du matin.'], ['streak_3', '3 jours d\'affilée', 'Écoute au moins une musique 3 jours de suite.'],
    ['streak_7', '7 jours d\'affilée', 'Écoute au moins une musique 7 jours de suite.'], ['streak_30', '30 jours d\'affilée', 'Écoute au moins une musique 30 jours de suite.'],
    ['streak_100', '100 jours d\'affilée', 'Écoute au moins une musique 100 jours de suite.'], ['weekend_warrior', 'Weekend warrior', 'Écoute de la musique chaque samedi et dimanche d\'un mois complet.'],
    ['explorer_50_artists', 'Explorateur', 'Découvre 50 artistes différents.'], ['fresh_out', 'Petit nouveau', 'Écoute un morceau ajouté à ta bibliothèque il y a moins de 24h.'],
    ['first_favorite', 'Coup de cœur', 'Ajoute ton tout premier favori.'], ['fifty_favorites', 'Grand collectionneur', 'Ajoute 50 favoris.'],
    ['loyal_fan', 'Fidèle', 'Écoute le même morceau 50 fois.'], ['obsession', 'Obsession', 'Écoute le même morceau 10 fois dans la même journée.'],
    ['architect', 'Architecte', 'Crée ta première playlist.'], ['dj_in_training', 'DJ en herbe', 'Crée 10 playlists.'], ['mega_playlist', 'Méga playlist', 'Construis une playlist de 100 morceaux ou plus.'],
    ['early_bird', 'Lève-tôt', 'Écoute une musique avant 7h du matin.'], ['night_owl', 'Oiseau de nuit', 'Écoute une musique après minuit.'],
    ['sunday_ritual', 'Rituel du dimanche', 'Écoute de la musique chaque dimanche d\'un mois complet.'], ['one_year', 'Un an ensemble', 'Utilise NeoMusic pendant 1 an depuis sa première utilisation.'],
    ['new_years_eve', 'Réveillon musical', 'Écoute de la musique un 31 décembre.'], ['christmas', 'Musique de Noël', 'Écoute de la musique un 25 décembre.'],
    ['customizer', 'Personnalisation', 'Change le thème de l\'application.'], ['hidden_font', 'Police cachée', 'Débloque la police bonus via le code Discord.'],
    ['shortcut_pro', 'Raccourcis pro', 'Utilise un raccourci clavier 10 fois.'], ['lucky', 'Chanceux', 'Retombe deux fois de suite sur le même morceau en lecture aléatoire.'],
    ['friday_13', 'Vendredi 13', 'Écoute de la musique un vendredi 13.'], ['palindrome', 'Palindrome', 'Écoute de la musique à une heure miroir (ex: 12:12, 21:21).'],
    ['grand_prince', 'Grand prince', 'Reviens après 30 jours d\'absence, ou écoute 30 jours d\'affilée.'],
  ];
  const MU_ROW = 58, MU_TILE_W = 152, MU_TILE_H = 196, MU_GAP = 10;

  /* ---------- helpers ---------- */
  function mh(sel, props, ...kids) {  // mh('div.a#b', {text, onclick, style, ...attrs}, children...)
    const m = /^([a-z0-9]*)(.*)$/i.exec(sel), e = document.createElement(m[1] || 'div');
    for (const x of m[2].matchAll(/([.#])([\w-]+)/g)) x[1] === '.' ? e.classList.add(x[2]) : e.id = x[2];
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') || k === 'value' || k === 'checked' || k === 'disabled') e[k] = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    e.append(...kids.flat().filter(k => k != null && k !== false));
    return e;
  }
  const muTime = s => { s = Math.max(0, Math.floor(+s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
  const muClock = s => { s = Math.max(0, Math.floor(+s || 0)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };  // "00:00 / 03:45" like MuPlayer's progress
  const muParse = t => String(t || '').split(':').reduce((a, p) => a * 60 + (+p || 0), 0);
  const muId = t => t ? (t.url ? 'url:' + t.url : 'file:' + (t.file || '')) : '';
  const muDur = t => +t.duration || muParse(t.song_length);
  const muToday = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const muStamp = (d = new Date()) => muToday(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const muWeek = (d = new Date()) => { const y0 = new Date(d.getFullYear(), 0, 1), yday = Math.floor((d - y0) / 864e5), wd = (d.getDay() + 6) % 7; return d.getFullYear() + '-W' + String(Math.floor((yday + 7 - wd) / 7)).padStart(2, '0'); };  // Python's %Y-W%W
  const muHex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const muShade = (h, f) => '#' + muHex(h).map(c => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)).toString(16).padStart(2, '0')).join('');
  const muBlend = (a, b, k) => { const x = muHex(a), y = muHex(b); return '#' + x.map((c, i) => Math.round(c + (y[i] - c) * k).toString(16).padStart(2, '0')).join(''); };
  const muLog = [];
  const muWarn = (where, e) => { muLog.push(muStamp() + '  ' + where + ' : ' + (e?.message || e)); if (muLog.length > 300) muLog.shift(); };

  /* ---------- the library (music.json) ---------- */
  const MU_DEFAULT_SETTINGS = {theme: 'Nova', volume: .5, equalizer: 'Normal', eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], limiter: false, balance: 0, visualizer: true, waveform: true, vinyl: true,
    replaygain: true, coverFade: true, dateAdded: false, releaseDate: false, mini: false, gallery: false, noImages: false, weeklyWeek: '', superVis: false, deckLuxe: true, recoSeen: [], pixelUi: true, shortcuts: {}};
  function muBlank() {
    return {v: 1, settings: {...MU_DEFAULT_SETTINGS}, playlists: MU_SYSTEM.map(name => ({name, mode: 'offline', tracks: []})),
      stats: {plays: 0, seconds: 0, songs: {}, songs_time: {}, artists: {}, artists_time: {}, daily: {}, history: [], xp_level_seen: 1},
      achievements: {unlocked: {}, progress: {unique_songs: [], unique_artists: [], streak_count: 0, last_active_date: null, first_seen_date: muToday(), obsession_date: null, obsession_counts: {},
        weekend_month: null, weekend_days: [], sunday_month: null, sunday_days: [], playlists_created: 0, shortcut_uses: 0, last_shuffle_identity: null}},
      trash: [], session: null};
  }
  function muRepair(d) {  // older or partial saves: every field exists, the 3 system playlists come first
    const b = muBlank();
    d = d && typeof d === 'object' ? d : b;
    d.settings = {...b.settings, ...d.settings}; d.settings.shortcuts ||= {};
    if (!Array.isArray(d.settings.eqBands) || d.settings.eqBands.length !== 10) d.settings.eqBands = [...b.settings.eqBands];
    d.playlists = Array.isArray(d.playlists) ? d.playlists.filter(p => p?.name) : [];
    for (const p of d.playlists) { p.tracks = Array.isArray(p.tracks) ? p.tracks.filter(t => t && (t.url || t.file)) : []; p.mode = p.mode === 'online' ? 'online' : 'offline'; }
    const sys = MU_SYSTEM.map(n => d.playlists.find(p => p.name.normalize('NFC').trim() === n) || {name: n, mode: 'offline', tracks: []});
    d.playlists = [...sys, ...d.playlists.filter(p => !MU_SYSTEM.includes(p.name.normalize('NFC').trim()))];
    d.stats = {...b.stats, ...d.stats}; d.achievements = {unlocked: {...d.achievements?.unlocked}, progress: {...b.achievements.progress, ...d.achievements?.progress}};
    d.trash = Array.isArray(d.trash) ? d.trash : [];
    return d;
  }
  let mu = null, muCache = {}, muSaveTimer = null, muCacheDirty = false, muLoaded = null;
  const muSave = (ms = 1200) => { clearTimeout(muSaveTimer); muSaveTimer = setTimeout(() => { muSaveTimer = null; neo.musicSave(mu).catch(e => muWarn('sauvegarde', e)); }, ms); };
  function muLoad() {
    return muLoaded ??= Promise.all([neo.musicLoad(), neo.musicCacheLoad()]).then(([d, c]) => {
      mu = muRepair(d); muCache = c || {};
      muHotkeys(); muCleanupTrash();
      setTimeout(muSyncFiles, 8000);  // once the launch has settled
      setInterval(() => { if (muCacheDirty) { muCacheDirty = false; neo.musicCacheSave(muCache).catch(() => {}); } }, 30000);
    });
  }
  const muPl = name => mu.playlists.find(p => p.name === name);
  const muFavIds = () => new Set(muPl('Favoris').tracks.map(muId));
  const muIsFav = t => muFavIds().has(muId(t));
  const muOnline = name => muPl(name)?.mode === 'online';

  /* ---------- state of the player ---------- */
  const mp = {pl: 'Favoris', view: [], queue: [], cur: null, sel: new Set(), anchor: null, paused: false, resume: 0, length: 0, gain: 1, lastTick: 0, saveAt: 0, skipAt: 0, debounce: null,
    sleepTracks: null, sleepAt: null, wakeAt: null, wakeTimer: null, status: '', statusTimer: null, built: false, exists: {}, cover: '', recoUrl: '', recoReq: 0, busyQueue: Promise.resolve()};
  let muAudio = null, muCtx = null, muNodes = null, T = MU_THEMES.Nova;

  /* ---------- icons (vector, like MuPlayer's PIL-drawn ones) ---------- */
  const MU_PX = {
    menu: ['................', '................', '................', '..############..', '..############..', '................', '................', '..############..', '..############..', '................', '................', '..############..', '..############..'],
    mini: ['................', '................', '..############..', '..############..', '..##........##..', '..##........##..', '..##........##..', '..##...#####.##.', '..##...#####.##.', '..##........##..', '..############..', '..############..'],search:['................','....######......','...##....##.....','..##......##....','..#........#....','..#........#....','..#........#....','..#........#....','..##......##....','...##....###....','....######.##...','............###.','.............###','..............##'],
    note:['................','.....#########..','.....#########..','.....##.....##..','.....##.....##..','.....##.....##..','.....##.....##..','.....##.....##..','..#####..#####..','.######.######..','.######.######..','..####...####...'],
    compass:['.....######.....','...###....###...','..##........##..','.##....##....##.','.#....#..#....#.','#....#....#....#','#...#..##..#...#','#..#..####..#..#','#...#..##..#...#','#....#....#....#','.#....#..#....#.','.##....##....##.','..##........##..','...###....###...','.....######.....'],
    shuffle:['................','................','...........#....','...........##...','###......#####..','...#....#..##...','....#..#...#....','.....##.........','.....##.........','....#..#...#....','...#....#..##...','###......#####..','...........##...','...........#....'],
    moon:['................','......####......','....######......','...#####........','..#####.........','..#####.........','.#####..........','.#####..........','.#####..........','..#####.....##..','..######..#####.','...###########..','....#########...','......#####.....'],
    clock:['.....######.....','...###....###...','..##........##..','.##....##....##.','.#.....##.....#.','#......##......#','#......##......#','#......#####...#','#..............#','#..............#','.#............#.','.##..........##.','..##........##..','...###....###...','.....######.....'],
    bars:['................','................','...........###..','...........###..','...........###..','...........###..','......###..###..','......###..###..','......###..###..','......###..###..','.###..###..###..','.###..###..###..','.###..###..###..','.###..###..###..','.###..###..###..'],
    trophy:['................','..############..','###.########.###','#.#.########.#.#','#.#..######..#.#','.##...####...##.','......####......','.......##.......','.......##.......','.......##.......','....########....','....########....','...##########...'],
    trash:['................','......####......','......#..#......','..############..','..############..','................','...###.##.###...','...###.##.###...','...###.##.###...','...###.##.###...','...###.##.###...','...###.##.###...','...###.##.###...','...##########...','....########....'],
    gear:['................','......####......','..##..####..##..','.####.####.####.','..############..','..####....####..','######....######','######....######','..####....####..','..############..','.####.####.####.','..##..####..##..','......####......'],
    globe:['.....######.....','...###.##.###...','..##..#..#..##..','.##...#..#...##.','.#....#..#....#.','#.....#..#.....#','#.....#..#.....#','################','#.....#..#.....#','#.....#..#.....#','.#....#..#....#.','.##...#..#...##.','..##..#..#..##..','...###.##.###...','.....######.....'],
    heart:['................','................','..####....####..','.######..######.','################','################','################','################','.##############.','..############..','...##########...','....########....','.....######.....','......####......','.......##.......'],
    heartO:['................','................','..####....####..','.#....#..#....#.','#......##......#','#..............#','#..............#','#..............#','.#............#.','..#..........#..','...#........#...','....#......#....','.....#....#.....','......#..#......','.......##.......'],
    close:['................','................','................','..##........##..','...##......##...','....##....##....','.....##..##.....','......####......','......####......','.....##..##.....','....##....##....','...##......##...','..##........##..'],
    play:['................','................','...##...........','...####.........','...######.......','...########.....','...##########...','...############.','...############.','...##########...','...########.....','...######.......','...####.........','...##...........'],
    pause:['................','................','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...','...####..####...'],
    next:['................','................','..##.........##.','..####.......##.','..######.....##.','..########...##.','..##########.##.','..##########.##.','..########...##.','..######.....##.','..####.......##.','..##.........##.'],
    prev:['................','................','.##.........##..','.##.......####..','.##.....######..','.##...########..','.##.##########..','.##.##########..','.##...########..','.##.....######..','.##.......####..','.##.........##..']};
  // one pixel-art drawing = one path of unit squares (rows merged), white (currentColor), never smoothed
  const muPx = (rows, size) => { let d = ''; rows.forEach((r, y) => { for (const m of r.matchAll(/#+/g)) d += 'M' + m.index + ' ' + y + 'h' + m[0].length + 'v1h-' + m[0].length + 'z'; });
    return `<svg viewBox="0 0 16 ${rows.length}" width="${size}" height="${size * rows.length / 16}" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`; };
  const muIcon = (k, size = 16) => muPx(MU_PX[k], size);
  const muLock = (size = 34, open = false) => `<svg viewBox="0 0 34 34" width="${size}" height="${size}" aria-hidden="true">${open
    ? '<path d="M15 16v-5a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="3.6"/>' : '<path d="M10.5 16v-4.5a6.5 6.5 0 0 1 13 0V16" fill="none" stroke="currentColor" stroke-width="3.6"/>'}<rect x="7" y="16" width="20" height="15" rx="4" fill="currentColor"/><circle cx="17" cy="22" r="2.2" fill="var(--mcard2)"/><path d="M16 23h2l.6 4.6h-3.2z" fill="var(--mcard2)"/></svg>`;

  /* ---------- the interface, built once like MuPlayer's build_ui ---------- */
  function muBuild() {
    if (mp.built) return;
    mp.built = true;
    const root = $('musicApp');
    const sideBtn = (icon, text, fn) => mh('button.muSideBtn', {onclick: fn, html: muIcon(icon) + '<span>' + text + '</span>'});
    root.replaceChildren(mh('div.mu#mu', {},
      mh('div.muTop', {}, mh('i.muTopStrip'), mh('button.muTopBtn.muMenuBtn', {title: 'Masquer / afficher le menu', html: muIcon('menu', 16), onclick: () => $('muSide').classList.toggle('closed')}), mh('b.muBrand', {text: 'NEOMUSIC'}), mh('span.muStatus#muStatus', {text: '●  Prêt'}),
        mh('div.muDl', {}, mh('i#muDl')), mh('span.muInd#muSleep'), mh('span.muInd#muWake')),
      mh('div.muBody', {},
        mh('aside.muSide#muSide', {}, mh('i.muSideStrip'),
          mh('div.muSideIn', {},
            mh('div.muHead', {text: 'PLAYLISTS'}), mh('div#muPlaylists'),
            mh('div.muPills.muExtra', {}, mh('button.muPill', {text: '＋ Nouvelle', onclick: () => muNewPlaylist()}), mh('button.muPill.danger', {text: '－ Supprimer', onclick: () => muDeletePlaylist()})),
            mh('div.muHead.muExtra', {text: 'BIBLIOTHÈQUE'}),
            mh('div.muExtra', {},
              sideBtn('search', 'Rechercher / importer', () => muSearchDialog()), sideBtn('compass', 'Chercher un artiste', () => muArtistDialog()), sideBtn('note', 'Importer une playlist', () => $('muFile').click()),
              sideBtn('shuffle', 'Lecture aléatoire', () => muShuffle()),
              sideBtn('moon', 'Mode sommeil', () => muSleepDialog()), sideBtn('clock', 'Réveil musical', () => muWakeDialog()),
              sideBtn('bars', 'Statistiques', () => muStats()), sideBtn('trophy', 'Succès', () => muAchievements()),
              sideBtn('trash', 'Corbeille', () => muTrash()), sideBtn('gear', 'Options', () => muOptions()))),
          ),
        mh('main.muMain', {},
          mh('section.muCard.muNow', {},
            mh('div.muCoverWrap#muCoverWrap', {}, mh('canvas#muCover', {width: 540, height: 400})),
            mh('div.muInfo', {},
              mh('span.muKick', {text: 'LECTURE EN COURS'}), mh('div.muTitle#muTitle', {text: 'Aucune musique sélectionnée'}), mh('span.muTime#muTime', {text: '00:00 / 00:00'}),
              mh('canvas.muProgress#muProgress', {height: 36}), mh('canvas.muSpectrum#muSpectrum', {height: 64}),
              mh('div.muControls', {},
                mh('button.muSkip#muPrev', {title: 'Morceau précédent', html: '<svg viewBox="0 0 40 40"><circle class="halo" cx="20" cy="20" r="19.5"/></svg>' + muPx(MU_PX.prev, 28).replace('<svg', '<svg style="position:absolute;inset:6px"'), onclick: () => muPrev()}),
                mh('button.muPlay#muPlay', {title: 'Lecture / pause', onclick: () => muToggle()}),
                mh('button.muSkip#muNext', {title: 'Morceau suivant', html: '<svg viewBox="0 0 40 40"><circle class="halo" cx="20" cy="20" r="19.5"/></svg>' + muPx(MU_PX.next, 28).replace('<svg', '<svg style="position:absolute;inset:6px"'), onclick: () => muNext()}))),
            mh('div.muNowSide.muExtra', {},
              mh('button.muBtn#muFav', {text: '♡ FAVORI', onclick: () => muToggleFav()}),
              mh('span.muSmall', {text: 'VOLUME'}), mh('input.muRange#muVol', {type: 'range', min: 0, max: 100, oninput: e => muSetVolume(e.target.value / 100)}),
              mh('span.muSmall', {text: 'PROFIL AUDIO'}), mh('select.muSelect#muEq', {onchange: e => muSetEq(e.target.value)}))),
          mh('section.muCard.muReco.muExtra', {},
            mh('div.muArt.alt#muRecoCover'), mh('div.muRecoText', {}, mh('span.muKick.alt', {text: 'RECOMMANDÉ POUR TOI'}), mh('span#muReco', {text: '—'})),
            mh('button.muBtn', {text: '↻ AUTRE', title: 'Proposer une autre musique', onclick: () => muScheduleReco()}), mh('button.muBtn.accent', {text: '＋ AJOUTER', onclick: () => muAddReco()})),
          mh('section.muCard.muLib', {},
            mh('div.muLibHead', {}, mh('b#muLibTitle', {text: 'Favoris'}), mh('span#muCount', {text: '0 titres'})),
            mh('div.muFilters.muExtra', {},
              mh('input.muFilter#muFilter', {placeholder: 'Titre ou artiste...', spellcheck: 'false', oninput: () => { clearTimeout(mp.ft); mp.ft = setTimeout(muRefresh, 220); }}),
              mh('select.muSelect.sub#muDurFilter', {onchange: () => muRefresh()}, ...['Toutes durées', 'Moins de 3 min', '3 à 5 min', 'Plus de 5 min'].map(t => mh('option', {text: t}))),
              mh('select.muSelect.sub#muSort', {onchange: () => muSort()}, ...['Ajout récent', 'Lecture récente', 'Alphabétique', 'Artiste', 'Date de publication'].map(t => mh('option', {text: t})))),
            mh('div.muList#muList', {tabindex: 0}, mh('div#muSpacer'))))),
      mh('div.muLayer#muLayer'),
      mh('input#muFile', {type: 'file', accept: '.json,.csv,.txt', hidden: true, onchange: e => { const f = e.target.files[0]; e.target.value = ''; if (f) muImportFile(f); }})));
    $('muEq').replaceChildren(...Object.keys(MU_PRESETS).map(k => mh('option', {text: k})));
    $('muList').onscroll = () => muDraw();
    new ResizeObserver(() => { muDraw(); muDrawProgress(true); }).observe($('muList'));
    new ResizeObserver(() => muDrawProgress(true)).observe($('muProgress'));
    muProgressEvents();
    $('muList').onkeydown = e => { if (e.key === 'Enter' && mp.sel.size) muRequest(Math.min(...mp.sel)); if (e.key === 'Delete' && mp.sel.size) muDeleteSelection(); };
    muMiniBuild();
    muApplyTheme(); muApplySettingsUi();
    muLoadPlaylist(mu.session?.playlist && muPl(mu.session.playlist) ? mu.session.playlist : 'Favoris');
    muRestoreSession();
    requestAnimationFrame(muFrame);
    setInterval(muClockTick, 250);
    muWeekly();
    muStartupAchievements();
  }
  function muApplyTheme() {
    T = MU_THEMES[mu.settings.theme] || MU_THEMES.Nova;
    const v = {bg: 'BG', side: 'SIDEBAR', card: 'CARD', card2: 'CARD_ALT', border: 'BORDER', text: 'TEXT', sub: 'SUBTEXT', acc: 'ACCENT', acc2: 'ACCENT_2', danger: 'DANGER', warn: 'WARN', heart: 'HEART'};
    for (const s of [$('mu').style, $('muMini').style]) {  // the portable player wears the theme too
      for (const [k, c] of Object.entries(v)) s.setProperty('--m' + k, T[c]);
      s.setProperty('--mpress', muShade(T.CARD, -.18));
    }
    mp.disc = null; mp.discKey = ''; mp.specKey = '';
    muPlayIcon();
  }
  function muApplySettingsUi() {
    const st = mu.settings;
    $('muVol').value = Math.round(st.volume * 100);
    $('muEq').value = st.equalizer in MU_PRESETS ? st.equalizer : 'Normal';
    $('mu').classList.toggle('mini', !!st.mini); $('mu').classList.toggle('px', !!st.pixelUi);
    $('mu').classList.toggle('novis', !st.visualizer);
    $('mu').classList.toggle('gallery', !!st.gallery);
    $('muCoverWrap').classList.toggle('rect', !st.vinyl);
    muAudioSettings();
  }

  /* ---------- playlists in the sidebar ---------- */
  function muSidebar() {
    $('muPlaylists').replaceChildren(...mu.playlists.map(p => {
      const icon = muIcon(p.name === 'Favoris' ? 'heart' : p.mode === 'online' ? 'globe' : 'note', 13);
      const b = mh('button.muPlBtn' + (p.name === mp.pl ? '.on' : ''), {html: `<i></i><span class="ic">${icon}</span><span>${mhEsc(p.name)}</span>`, onclick: () => muLoadPlaylist(p.name)});
      b.oncontextmenu = e => { e.preventDefault(); muLoadPlaylist(p.name); };
      return b;
    }));
  }
  const mhEsc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
  function muLoadPlaylist(name) {
    if (!muPl(name)) name = 'Favoris';
    mp.pl = name; mp.sel.clear(); mp.anchor = null;
    $('muLibTitle').textContent = name;
    muSidebar(); muRefresh();
    $('muList').scrollTop = 0;
    muCheckFiles(muPl(name).tracks);
  }
  // on a PC that got the library through the sync, offline files may be missing here: known once per file
  async function muCheckFiles(tracks) {
    const names = [...new Set(tracks.map(t => t.file).filter(f => f && !(f in mp.exists)))];
    if (!names.length) return;
    Object.assign(mp.exists, await neo.musicExists(names));
    muDraw();
  }

  /* ---------- the list: filters, sort, virtual rows (only what is on screen exists), list or cover wall ---------- */
  function muRefresh() {
    const p = muPl(mp.pl); if (!p) return;
    const q = $('muFilter').value.trim().toLowerCase(), d = $('muDurFilter').value;
    mp.view = p.tracks.filter(t => {
      if (q && !((t.display_title || '').toLowerCase().includes(q) || (t.author || '').toLowerCase().includes(q))) return false;
      const s = muDur(t);
      return d === 'Moins de 3 min' ? s < 180 : d === '3 à 5 min' ? s >= 180 && s <= 300 : d === 'Plus de 5 min' ? s > 300 : true;
    });
    const n = p.tracks.length;
    $('muCount').textContent = n + ' ' + (n > 1 ? 'titres' : 'titre');
    mp.favs = muFavIds();
    mp.drawn = new Map(); $('muSpacer').replaceChildren();
    muDraw();
  }
  function muGeometry() {
    const list = $('muList'), gal = mu.settings.gallery;
    const cols = gal ? Math.max(1, Math.floor((list.clientWidth - 8 + MU_GAP) / (MU_TILE_W + MU_GAP))) : 1;
    const rowH = gal ? MU_TILE_H + MU_GAP : MU_ROW;
    return {cols, rowH, rows: Math.ceil(mp.view.length / cols)};
  }
  function muDraw() {
    if (!mp.built) return;
    const list = $('muList'), sp = $('muSpacer'), g = muGeometry();
    sp.style.height = g.rows * g.rowH + 'px';
    const first = Math.max(0, Math.floor(list.scrollTop / g.rowH) - 4), last = Math.min(g.rows - 1, Math.ceil((list.scrollTop + list.clientHeight) / g.rowH) + 4);
    const want = new Set();
    for (let r = first; r <= last; r++) for (let c = 0; c < g.cols; c++) { const i = r * g.cols + c; if (i < mp.view.length) want.add(i); }
    mp.drawn ||= new Map();
    for (const [i, node] of mp.drawn) if (!want.has(i) || node._t !== mp.view[i] || node._g !== mu.settings.gallery) { node.remove(); mp.drawn.delete(i); }
    for (const i of want) {
      let node = mp.drawn.get(i);
      if (!node) { node = muRowNode(i); mp.drawn.set(i, node); sp.append(node); }
      const r = Math.floor(i / g.cols), c = i % g.cols;
      node.style.transform = mu.settings.gallery ? `translate(${c * (MU_TILE_W + MU_GAP) + 4}px, ${r * g.rowH}px)` : `translateY(${r * MU_ROW}px)`;
      muRowState(node, i);
    }
  }
  function muArt(t, size, cls = '') {  // ArtworkFrame: framed cover, or the "?" placeholder; a cover missing on this PC is fetched again
    const box = mh('div.muArt' + cls, {style: {width: size + 'px', height: size + 'px'}});
    if (t?.cover && !mu.settings.noImages) {
      const img = mh('img', {src: 'neoplugin://neodex.music/cover/' + encodeURIComponent(t.cover), loading: 'lazy', draggable: 'false', alt: ''});
      img.onerror = () => { img.remove(); muFetchCover(t).then(ok => { if (ok) box.append(mh('img', {src: 'neoplugin://neodex.music/cover/' + encodeURIComponent(t.cover) + '?r=' + Date.now(), alt: ''})); }); };
      box.append(img);
    }
    return box;
  }
  const muCoverJobs = new Map();
  function muFetchCover(t) {
    if (!t.thumbnail_url) return Promise.resolve(false);
    if (!muCoverJobs.has(t.thumbnail_url)) muCoverJobs.set(t.thumbnail_url, neo.musicCover(t.thumbnail_url).then(name => { if (name) { if (t.cover !== name) { t.cover = name; muSave(); } return true; } return false; }).catch(() => false));
    return muCoverJobs.get(t.thumbnail_url);
  }
  function muRowNode(i) {
    const t = mp.view[i], gal = mu.settings.gallery, fav = mp.favs.has(muId(t));
    let sub = t.author || 'Artiste inconnu';
    const extra = [];
    if (mu.settings.dateAdded && t.date_added) extra.push('Ajouté le ' + new Date(t.date_added * 1000).toLocaleDateString('fr-FR'));
    if (mu.settings.releaseDate && /^\d{8}$/.test(t.publish_date || '')) extra.push('Sorti le ' + t.publish_date.replace(/(\d{4})(\d\d)(\d\d)/, '$3/$2/$1'));
    if (extra.length) sub += '  ·  ' + extra.join('  ·  ');
    const missing = t.file && mp.exists[t.file] === false && !t.url;
    const favBtn = mh('button.muRowFav' + (fav ? '.on' : ''), {html: muIcon(fav || mu.settings.pixelUi ? 'heart' : 'heartO', 16), title: fav ? 'Retirer des favoris' : 'Ajouter aux favoris', onclick: e => { e.stopPropagation(); muFlash(e.currentTarget, T.HEART); muToggleFav(t); }});
    const del = mh('button.muRowDel', {html: muIcon('close', 16), title: 'Supprimer', onclick: e => { e.stopPropagation(); muFlash(e.currentTarget, T.DANGER); muDeleteTracks([t]); }});
    const node = gal
      ? mh('div.muTile', {}, mh('i.muStrip'), muArt(t, 120), mh('b', {text: t.display_title || t.file}), mh('span', {text: sub}), mh('em', {text: muTime(muDur(t))}), mh('div.muTileAct', {}, favBtn, del))
      : mh('div.muRow' + (missing ? '.missing' : ''), {}, mh('i.muStrip'), muArt(t, 42), mh('div.muRowText', {}, mh('b', {text: t.display_title || t.file}),
        mh('div', {}, mh('span', {text: sub}))), mh('em.muRowDur', {text: muTime(muDur(t))}), favBtn, del);
    node._t = t; node._g = gal;
    node.onclick = e => muRowClick(i, e);
    node.ondblclick = () => muRequest(i);
    node.oncontextmenu = e => { e.preventDefault(); muContext(e, i); };
    return node;
  }
  function muRowState(node, i) {
    const t = mp.view[i], sel = mp.sel.has(i), playing = mp.cur && muId(mp.cur) === muId(t);
    node.classList.toggle('sel', sel); node.classList.toggle('playing', !!playing);
    const fav = mp.favs.has(muId(t)), fb = node.querySelector('.muRowFav');
    if (fb && fb.classList.contains('on') !== fav) { fb.classList.toggle('on', fav); fb.innerHTML = muIcon(fav || mu.settings.pixelUi ? 'heart' : 'heartO', 16); }
    node.classList.toggle('missing', !!(t.file && mp.exists[t.file] === false));
  }
  function muFlash(b, color) { const c = b.style.color; b.style.color = color; setTimeout(() => b.style.color = c, 130); }
  function muRowClick(i, e) {  // Ctrl: toggle, Shift: range from the anchor, plain click: one
    if (e.shiftKey && mp.anchor != null) { mp.sel = new Set(); const [a, b] = [mp.anchor, i].sort((x, y) => x - y); for (let k = a; k <= b; k++) mp.sel.add(k); }
    else if (e.ctrlKey) { mp.sel.has(i) ? mp.sel.delete(i) : mp.sel.add(i); mp.anchor = i; }
    else { mp.sel = new Set([i]); mp.anchor = i; }
    muDraw();
  }
  function muContext(e, i) {
    const multi = mp.sel.size > 1 && mp.sel.has(i);
    if (!multi) { mp.sel = new Set([i]); mp.anchor = i; muDraw(); }
    const t = mp.view[i], sel = multi ? [...mp.sel].sort((a, b) => a - b).map(k => mp.view[k]) : [t];
    const targets = mu.playlists.filter(p => p.name !== mp.pl);
    const sub = targets.length ? targets.map(p => [(p.mode === 'online' ? '🌐 ' : '') + p.name, () => muAddTracksTo(sel, p.name)]) : [['Aucune autre playlist', null]];
    const items = multi
      ? [['▶  Lire', () => muRequest(i)], ['➕  Ajouter les ' + sel.length + ' sélectionnées à...', sub], null, ['✕  Supprimer les ' + sel.length + ' sélectionnées', () => muDeleteTracks(sel)]]
      : [['▶  Lire', () => muRequest(i)], muIsFav(t) ? ['♡  Retirer des favoris', () => muToggleFav(t)] : ['♥  Ajouter aux favoris', () => muToggleFav(t)], ['➕  Ajouter à...', sub],
        t.file ? ['📂  Afficher le fichier', () => neo.musicReveal(t.file)] : null, null, ['✕  Supprimer', () => muDeleteTracks([t])]];
    muMenu(e.clientX, e.clientY, items.filter(x => x !== undefined));
  }
  function muMenu(x, y, items) {
    document.querySelectorAll('.muMenu').forEach(m => m.remove());
    const build = (list, px, py) => {
      const m = mh('div.muMenu');
      for (const it of list) {
        if (!it) { m.append(mh('hr')); continue; }
        const [label, act] = it, b = mh('button', {text: label + (Array.isArray(act) ? '   ›' : ''), disabled: !act});
        if (Array.isArray(act)) b.onmouseenter = () => { m.querySelectorAll('.muMenu').forEach(s => s.remove()); const r = b.getBoundingClientRect(); const s = build(act, r.right - 4, r.top - 4); s.classList.add('sub'); m.append(s); };
        else if (act) b.onclick = () => { document.querySelectorAll('.muMenu').forEach(m => m.remove()); act(); };
        m.append(b);
      }
      m.style.left = px + 'px'; m.style.top = py + 'px';
      return m;
    };
    const m = build(items, x, y); $('mu').append(m);  // inside #mu: it needs the theme colours
    const r = m.getBoundingClientRect(); if (r.right > innerWidth) m.style.left = innerWidth - r.width - 6 + 'px'; if (r.bottom > document.body.clientHeight) m.style.top = document.body.clientHeight - r.height - 6 + 'px';
    setTimeout(() => addEventListener('pointerdown', function close(ev) { if (!ev.target.closest('.muMenu')) { document.querySelectorAll('.muMenu').forEach(m => m.remove()); removeEventListener('pointerdown', close, true); } }, true));
  }
  function muSort() {
    const p = muPl(mp.pl), o = $('muSort').value, k = (t, f) => (t[f] || '').toLowerCase();
    const cmp = {'Ajout récent': (a, b) => (b.date_added || 0) - (a.date_added || 0), 'Lecture récente': (a, b) => (b.last_played || 0) - (a.last_played || 0), 'Alphabétique': (a, b) => k(a, 'display_title').localeCompare(k(b, 'display_title')),
      'Artiste': (a, b) => k(a, 'author').localeCompare(k(b, 'author')) || k(a, 'display_title').localeCompare(k(b, 'display_title')), 'Date de publication': (a, b) => String(b.publish_date || '').localeCompare(String(a.publish_date || ''))}[o];
    p.tracks.sort(cmp); muSave(); mp.sel.clear(); muRefresh();
  }

  /* ---------- audio: <audio> through Web Audio (10-band equaliser, balance, limiter, analyser for the spectrum) ---------- */
  function muEngine() {
    if (muAudio) return;
    muAudio = new Audio(); muAudio.crossOrigin = 'anonymous'; muAudio.preload = 'auto';
    muCtx = new AudioContext();
    const src = muCtx.createMediaElementSource(muAudio);
    const eq = MU_BANDS.map((f, i) => { const b = muCtx.createBiquadFilter(); b.type = i === 0 ? 'lowshelf' : i === 9 ? 'highshelf' : 'peaking'; b.frequency.value = f; b.Q.value = f <= 62 ? .7 : 1.1; return b; });
    const pan = muCtx.createStereoPanner(), comp = muCtx.createDynamicsCompressor(), analyser = muCtx.createAnalyser(), gain = muCtx.createGain(), dry = muCtx.createGain();
    comp.threshold.value = -6; comp.knee.value = 4; comp.ratio.value = 12; comp.attack.value = .005; comp.release.value = .08;
    analyser.fftSize = 4096; analyser.smoothingTimeConstant = 0;  // smoothed like MuPlayer instead, see muSpectrumBlock
    src.connect(eq[0]); eq.reduce((a, b) => (a.connect(b), b)).connect(pan);
    pan.connect(dry); dry.connect(analyser); comp.connect(analyser); analyser.connect(gain); gain.connect(muCtx.destination);
    muNodes = {eq, pan, comp, analyser, gain, dry};
    muAudio.onended = () => muNext(true);
    muAudio.onerror = () => { if (!muAudio.src) return; muStatus('Erreur audio', T.DANGER); muWarn('lecture', muAudio.error?.message || 'flux illisible'); };
    muAudio.onplaying = () => { mp.paused = false; mp.lastTick = performance.now(); muPlayIcon(); muMiniSync(); };
    muAudio.onpause = () => { muPlayIcon(); muMiniPaint(); };
    muAudioSettings();
  }
  function muAudioSettings() {
    if (!muNodes) return;
    const st = mu.settings, gains = st.equalizer === 'Custom' ? st.eqBands : MU_PRESETS[st.equalizer] || MU_PRESETS.Normal;
    muNodes.eq.forEach((b, i) => b.gain.value = gains[i] || 0);
    muNodes.pan.pan.value = Math.max(-1, Math.min(1, +st.balance || 0));
    muNodes.pan.disconnect();
    muNodes.pan.connect(st.limiter || gains.some(g => g > 0) ? muNodes.comp : muNodes.dry);  // boosting profiles get a limiter, like MuPlayer's ffmpeg chains
    muVolumeApply();
  }
  function muVolumeApply() { if (muNodes) muNodes.gain.gain.value = Math.max(0, mu.settings.volume * (mu.settings.replaygain ? mp.gain : 1)); }
  function muSetVolume(v) { mu.settings.volume = Math.max(0, Math.min(1, v)); if ($('muVol')) $('muVol').value = Math.round(mu.settings.volume * 100); muVolumeApply(); muSave(2000); }
  function muSetEq(name) { mu.settings.equalizer = name; $('muEq').value = name; muAudioSettings(); muSave(); }
  const muSrc = t => t.file && mp.exists[t.file] !== false ? 'neoplugin://neodex.music/file/' + encodeURIComponent(t.file) : t.url ? 'neoplugin://neodex.music/stream/?u=' + encodeURIComponent(t.url) : '';

  /* ---------- play, pause, next, previous (anti-bounce 120 ms + 0.5 s between manual changes, like MuPlayer) ---------- */
  function muRequest(i, opts = {}) {
    if (performance.now() - mp.skipAt < 500) return false;
    mp.skipAt = performance.now();
    clearTimeout(mp.debounce);
    const queue = mp.view.slice();
    mp.debounce = setTimeout(() => muPlay(queue, i, opts), 120);
    return true;
  }
  async function muPlay(queue, i, {record = true, start = 0} = {}) {
    const t = queue[i]; if (!t) return;
    muEngine();
    if (muCtx.state === 'suspended') muCtx.resume();
    if (t.file && !(t.file in mp.exists)) Object.assign(mp.exists, await neo.musicExists([t.file]));
    if (t.file && mp.exists[t.file] === false && t.url && !muOnline(mp.pl) && muPlaylistOf(t)?.mode !== 'online') {  // synced from another PC: download the file here first
      muStatus('Téléchargement pour cet appareil...', T.ACCENT_2);
      try { await muDownloadInto(t); } catch (e) { muWarn('téléchargement', e); }
    }
    const src = muSrc(t);
    if (!src) return muNotify('error', 'Lecture', 'Cette musique n\'a pas de source disponible.');
    mp.queue = queue; mp.cur = t; mp.length = muDur(t); mp.resume = 0;
    mp.gain = muCache[muId(t)]?.g ?? 1; muVolumeApply();
    muAudio.src = src;
    if (start > 0) muAudio.addEventListener('loadedmetadata', () => { try { muAudio.currentTime = start; } catch {} }, {once: true});
    muAudio.play().catch(e => { if (e.name !== 'AbortError') { muStatus('Erreur audio', T.DANGER); muWarn('lecture', e); } });
    mp.paused = false; mp.lastTick = performance.now();
    muStatus(t.file && mp.exists[t.file] !== false ? 'Lecture' : 'Chargement du flux...', T.ACCENT_2);
    muAudio.addEventListener('playing', () => muStatus('Lecture', T.ACCENT_2), {once: true});
    $('muTitle').textContent = t.display_title || t.file; muFitTitle();
    muSetCover(t); muFavButton(); muDraw(); muDrawProgress(true);
    muAnalyse(t);
    if (record) muRecordPlay(t);
    muMiniPaint();
    muScheduleReco();
    muSaveSession();
  }
  const muPlaylistOf = t => mu.playlists.find(p => p.tracks.includes(t));
  function muToggle() {
    muEngine();
    if (mp.cur && !muAudio.paused) return muPause();
    if (mp.cur && muAudio.src && muAudio.paused && !muAudio.ended && mp.paused) { muCtx.resume(); muAudio.play(); mp.paused = false; mp.lastTick = performance.now(); muStatus('Lecture', T.ACCENT_2); muPlayIcon(); return; }
    const i = mp.sel.size ? Math.min(...mp.sel) : Math.max(0, mp.view.findIndex(t => muId(t) === muId(mp.cur)));
    if (!mp.view.length) return;
    const same = mp.cur && muId(mp.view[i]) === muId(mp.cur);
    muPlay(mp.view.slice(), i, {start: same ? mp.resume : 0});
  }
  function muPause() { if (!muAudio) return; muAudio.pause(); mp.paused = true; mp.lastTick = 0; muStatus('Pause', T.WARN); muPlayIcon(); muSaveSession(); }
  function muStop() { if (!muAudio) return; muAudio.pause(); muAudio.currentTime = 0; mp.paused = true; mp.lastTick = 0; muPlayIcon(); muStatus('Stop', T.SUBTEXT); }
  function muStep(d, auto) {
    const q = mp.queue.length ? mp.queue : mp.view; if (!q.length) return false;
    let i = q.findIndex(t => muId(t) === muId(mp.cur));
    i = i < 0 ? 0 : (i + d + q.length) % q.length;
    if (auto) { muPlay(q, i); return true; }
    if (performance.now() - mp.skipAt < 500) return false;
    mp.skipAt = performance.now(); clearTimeout(mp.debounce); mp.debounce = setTimeout(() => muPlay(q, i), 120);
    muSkipCooldown();
    return true;
  }
  function muNext(auto) { if (muSleepCountdown()) return false; return muStep(1, auto); }
  function muPrev() { return muStep(-1); }
  function muSkipCooldown() { for (const id of ['muPrev', 'muNext']) { const b = $(id); b.disabled = true; setTimeout(() => b.disabled = false, 500); } }
  function muSeek(sec) { if (!muAudio || !mp.cur) return; const d = muAudio.duration || mp.length; try { muAudio.currentTime = Math.max(0, Math.min(d - .2, sec)); } catch {} muDrawProgress(); }
  function muShuffle() {
    const p = muPl(mp.pl); if (!p.tracks.length) return;
    for (let i = p.tracks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p.tracks[i], p.tracks[j]] = [p.tracks[j], p.tracks[i]]; }
    muSave(); mp.sel.clear(); muRefresh();
    muShuffleAchievement(muId(p.tracks[0]));
    mp.skipAt = 0; muRequest(0);
  }
  function muPlayIcon() {
    const b = $('muPlay'); if (!b) return;
    const pause = muAudio && !muAudio.paused;
    b.innerHTML = `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="none" stroke="var(--mcard2)" stroke-width="2"/><circle class="fill" cx="32" cy="32" r="28"/></svg><span style="color:#06110C">${muPx(MU_PX[pause ? 'pause' : 'play'], 28)}</span>`;
  }
  function muFitTitle() {  // two lines at most, then an ellipsis (MuPlayer's set_song_title)
    const el = $('muTitle'), full = mp.cur?.display_title || el.textContent;
    el.textContent = full;
    if (el.scrollHeight <= el.clientHeight + 2) return;
    let lo = 0, hi = full.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; el.textContent = full.slice(0, m).trimEnd() + '…'; el.scrollHeight <= el.clientHeight + 2 ? lo = m : hi = m - 1; }
    el.textContent = full.slice(0, lo).trimEnd() + '…';
  }
  function muFavButton() {
    const fav = mp.cur && muIsFav(mp.cur), b = $('muFav');
    b.textContent = fav ? '♥ FAVORI' : '♡ FAVORI'; b.style.color = fav ? T.HEART : '';
  }

  /* ---------- waveform + ReplayGain of a track: decoded once in the page, kept on this PC ---------- */
  let muAnalysing = Promise.resolve();
  function muAnalyse(t) {
    const id = muId(t);
    if (muCache[id]?.w) return;
    muAnalysing = muAnalysing.then(async () => {
      if (muCache[id]?.w || muId(mp.cur) !== id) return;
      try {
        const buf = await (await fetch(muSrc(t))).arrayBuffer();
        const audio = await new OfflineAudioContext(1, 1, 22050).decodeAudioData(buf);
        const ch = audio.getChannelData(0), n = 200, step = Math.floor(ch.length / n) || 1, w = [];
        let sum = 0, cnt = 0;
        for (let b = 0; b < n; b++) { let s = 0; for (let i = b * step, e = Math.min(ch.length, i + step); i < e; i += 4) { s += ch[i] * ch[i]; sum += ch[i] * ch[i]; cnt++; } w.push(Math.sqrt(s / (step / 4))); }
        const mx = Math.max(...w) || 1, rms = Math.sqrt(sum / Math.max(1, cnt));
        muCache[id] = {w: w.map(v => Math.round(v / mx * 1e4) / 1e4), g: rms > 0 ? Math.max(.4, Math.min(1.6, .11 / rms)) : 1};
        muCacheDirty = true;
        if (muId(mp.cur) === id) { mp.gain = muCache[id].g; muVolumeApply(); muDrawProgress(true); }
      } catch (e) { muWarn('forme d\'onde', e); }
    });
  }

  /* ---------- the "now playing" visuals: vinyl (or square cover) with inertia, waveform progress, spectrum ---------- */
  function muSetCover(t) {
    mp.coverOld = mp.coverImg && mu.settings.coverFade ? {img: mp.coverImg, disc: mp.disc} : null;
    mp.fadeAt = performance.now();
    mp.coverImg = null; mp.disc = null;
    if (!t?.cover || mu.settings.noImages) return;
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { if (mp.cur === t) { mp.coverImg = img; mp.disc = null; mp.fadeAt = performance.now(); } };
    img.onerror = () => muFetchCover(t).then(ok => { if (ok && mp.cur === t) img.src = 'neoplugin://neodex.music/cover/' + encodeURIComponent(t.cover) + '?r=' + Date.now(); });
    img.src = 'neoplugin://neodex.music/cover/' + encodeURIComponent(t.cover);
  }
  /* ---------- la platine en pixel art : tout est posé pixel par pixel dans une petite image, agrandie ensuite sans lissage.
     Le disque tourne pour de vrai : chaque pixel va chercher sa couleur dans la pochette (réduite en gros pixels) à l'angle du moment.
     Le bras se pose quand la musique joue, avance vers le centre avec le morceau et se relève à la pause. ---------- */
  const MU_RPM = 200;  // 33 tours ⅓ par minute = 200° par seconde
  const muLuxe = () => !!mu.settings.deckLuxe && muLevel().level >= 150;  // niveau 150 : socle en bois, bras doré
  const muCol = c => { const [r, g, b] = muHex(c.length === 4 ? '#' + [...c.slice(1)].map(x => x + x).join('') : c); return (0xff000000 | b << 16 | g << 8 | r) >>> 0; };  // une couleur → un pixel d'ImageData
  function muPixLabel(img, d) {  // l'étiquette : la pochette réduite à d×d pixels, en peu de couleurs (ou une étiquette aux couleurs du thème)
    const cache = mp.pxLabels ??= new WeakMap(), k = img || muPixLabel, hit = cache.get(k);
    if (hit && hit.d === d && hit.t === T) return hit.p;
    const c = document.createElement('canvas'); c.width = c.height = d;
    const g = c.getContext('2d', {willReadFrequently: true});
    g.fillStyle = T.ACCENT; g.fillRect(0, 0, d, d); g.fillStyle = muShade(T.ACCENT_2 || T.ACCENT, -.35); g.fillRect(0, d >> 1, d, d - (d >> 1));
    if (img) { const s = Math.min(img.width, img.height); g.imageSmoothingQuality = 'high'; g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, d, d); }
    let p; try { p = new Uint32Array(g.getImageData(0, 0, d, d).data.buffer); } catch { p = new Uint32Array(d * d).fill(muCol(T.ACCENT)); }
    for (let i = 0; i < p.length; i++) p[i] = (p[i] & 0xffe0e0e0 | 0xff101010) >>> 0;  // 8 niveaux par couleur : l'aspect pixel art
    cache.set(k, {d, t: T, p}); return p;
  }
  function muPixBuf(key, W, H) {  // une petite image réutilisée d'une image à l'autre
    let b = mp[key]; if (!b || b.W !== W || b.H !== H) { const c = document.createElement('canvas'); c.width = W; c.height = H; const id = c.getContext('2d').createImageData(W, H); b = mp[key] = {W, H, c, id, P: new Uint32Array(id.data.buffer)}; }
    b.P.fill(0); return b;
  }
  function muPixKit(b) {
    const {W, H, P} = b, put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) P[y * W + x] = c; };
    const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .8) put(cx + x, cy + y, c); };
    const line = (x0, y0, x1, y1, c, t = 1) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) rect(Math.round(x0 + (x1 - x0) * i / n) - (t >> 1), Math.round(y0 + (y1 - y0) * i / n) - (t >> 1), t, t, c); };
    return {put, rect, disc, line};
  }
  function muPixRecord(b, cx, cy, R, angle, img) {  // le disque : étiquette = pochette qui tourne, sillons en deux tons, reflet fixe tramé
    const {put} = muPixKit(b), a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), lr = Math.max(3, Math.round(R * .42)), d = lr * 2, L = muPixLabel(img, d);
    const base = muBlend('#100e16', T.CARD, .12), c0 = muCol(base), c1 = muCol(muShade(base, .08)), cGap = muCol(muShade(base, -.4)), cHi = muCol(muShade(base, .3)), cRim = muCol(muShade(base, .22)), cLip = muCol(muShade(base, -.3));
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const d2 = x * x + y * y; if (d2 > R * R + R * .8) continue;
      const r = Math.sqrt(d2); let c;
      if (r <= lr - .5) { const u = Math.max(0, Math.min(d - 1, Math.round(x * ca + y * sa + lr - .5))), v = Math.max(0, Math.min(d - 1, Math.round(-x * sa + y * ca + lr - .5))); c = L[v * d + u]; }
      else if (r < lr + 1) c = cLip;
      else if (r > R - 1) c = cRim;
      else {
        const k = Math.round(r); c = k % 2 ? c0 : c1;
        if (k === Math.round(lr + (R - lr) * .45) || k === Math.round(lr + (R - lr) * .75)) c = cGap;  // les silences entre les plages
        const th = Math.atan2(y, x), sec = Math.min(Math.abs(th + 2.3), Math.abs(th - .84));  // la lumière ne tourne pas avec le disque
        if (sec < .12 || (sec < .24 && (x + y & 1))) c = cHi;
      }
      put(cx + x, cy + y, c);
    }
    put(cx, cy, muCol('#e8eaf0'));  // l'axe
  }
  function muPixShow(g, b, w, h, s) {  // la petite image, agrandie d'un facteur entier, au centre
    b.c.getContext('2d').putImageData(b.id, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(b.c, Math.floor((w - b.W * s) / 2), Math.floor((h - b.H * s) / 2), b.W * s, b.H * s);
  }
  function muDeck(g, w, h, now, playing) {
    const s = Math.max(2, Math.round(h / 80)), W = Math.floor(w / s), H = Math.floor(h / s), b = muPixBuf('pxDeck', W, H), {put, rect, disc, line} = muPixKit(b), luxe = muLuxe();
    mp.coverOld = null;
    // le socle : bloc plat, liseré clair en haut, bande de couleur du thème en bas, coins coupés
    const base = luxe ? '#6b4426' : muShade(T.CARD, -.45), cB = muCol(base), cBd = muCol(luxe ? '#3a2312' : muShade(T.CARD, -.72));
    rect(1, 1, W - 2, H - 2, cB); rect(2, 1, W - 4, 1, muCol(muShade(base, .22))); rect(1, H - 4, W - 2, 1, muCol(T.ACCENT)); rect(1, H - 3, W - 2, 2, cBd);
    for (const [x, y] of [[1, 1], [W - 2, 1], [1, H - 2], [W - 2, H - 2]]) put(x, y, 0);
    if (luxe) { let q = 3; const rnd = () => (q = q * 16807 % 2147483647) / 2147483647; for (let i = 0; i < 14; i++) { const y = 3 + Math.floor(rnd() * (H - 9)), x = Math.floor(rnd() * W * .8); rect(x, y, 4 + Math.floor(rnd() * W * .3), 1, muCol('#5a371d')); } }
    // le plateau : ombre, bord métallique, points stroboscopiques qui tournent
    const pad = Math.round(H * .08), Rp = Math.floor(H / 2 - pad), cx = pad + Rp + 2, cy = Math.floor((H - 3) / 2), R = Rp - 2;
    disc(cx + 1, cy + 2, Rp, cBd); disc(cx, cy, Rp, muCol('#8d909d')); disc(cx, cy, Rp - 1, muCol('#1a1a20'));
    for (let i = 0; i < 24; i++) { const t = (mp.deckAng + i * 15) * Math.PI / 180; put(cx + Math.cos(t) * Rp, cy + Math.sin(t) * Rp, muCol(i % 2 ? '#c9ccd6' : '#55586a')); }
    muPixRecord(b, cx, cy, R, mp.deckAng, mp.coverImg);
    // le bras : pivot à droite, il se pose sur le bord et avance vers l'étiquette avec le morceau
    const pvx = Math.round(Math.min(W - pad - 5, cx + Rp + (W - cx - Rp) * .55)), pvy = Math.round(pad + H * .14), dx = cx - pvx, dy = cy - pvy, D = Math.hypot(dx, dy), Lr = D * .93;
    const at = rho => { const c = Math.max(-1, Math.min(1, (D * D + Lr * Lr - rho * rho) / (2 * D * Lr))); return Math.atan2(dy, dx) - Math.acos(c); };
    const dur = muAudio?.duration || mp.length || 0, pos = muAudio?.currentTime || mp.resume || 0, prog = dur ? Math.max(0, Math.min(1, pos / dur)) : 0;
    const target = mp.cur ? at(R * .94 - (R * .94 - R * .45) * prog) : at(R * 1.25);
    const dt = Math.min(64, now - (mp.armAt || now)); mp.armAt = now;
    mp.arm = mp.arm == null ? at(R * 1.25) : mp.arm + (target - mp.arm) * Math.min(1, dt * .006);
    mp.lift = (mp.lift ?? 1) + ((playing ? 0 : 1) - (mp.lift ?? 1)) * Math.min(1, dt * .008);
    const metal = luxe ? ['#ffe9a8', '#c99a3e', '#6e4a12'] : ['#f2f3f7', '#a4a7b4', '#4a4d5c'];
    const arm = sh => {
      const o = sh ? 1 + Math.round(mp.lift * 2) : 0, A = mp.arm, ax = pvx + o, ay = pvy + o, sx = pvx + Math.cos(A) * Lr + o, sy = pvy + Math.sin(A) * Lr + o;
      const hx = sx - Math.cos(A) * 4, hy = sy - Math.sin(A) * 4;
      line(ax - Math.cos(A) * 2, ay - Math.sin(A) * 2, ax - Math.cos(A) * 5, ay - Math.sin(A) * 5, muCol(sh ? '#000' : metal[2]), 4);  // contrepoids
      line(ax, ay, hx, hy, muCol(sh ? '#000' : metal[1]), 2); if (!sh) line(ax, ay - 1, hx, hy - 1, muCol(metal[0]), 1);  // le tube, éclairé dessus
      line(hx, hy, sx, sy, muCol(sh ? '#000' : '#1d1d24'), 3); if (!sh) put(hx + (sx - hx) * .5, hy + (sy - hy) * .5, muCol(T.ACCENT));  // la tête de lecture
    };
    if (mp.lift > .05) arm(true); arm(false);
    disc(pvx + 1, pvy + 1, 3, cBd); disc(pvx, pvy, 3, muCol(metal[1])); put(pvx - 1, pvy - 1, muCol(metal[0])); put(pvx - 2, pvy, muCol(metal[0])); rect(pvx, pvy, 1, 1, muCol('#23232b'));  // le pivot
    // le voyant et la vitesse en points
    const lx = W - pad - 3, ly = H - pad - 4; rect(lx, ly, 2, 2, muCol(playing ? T.ACCENT_2 || T.ACCENT : '#3a3a44'));
    for (let i = 0; i < 3; i++) put(lx - 4 - i * 2, ly + 1, muCol(i ? '#4a4d5c' : '#c9ccd6'));
    muPixShow(g, b, w, h, s);
  }
  function muSpin(now) {  // the record speeds up fast and slows down like a real turntable (shared by the big cover and the portable player)
    const playing = muAudio && !muAudio.paused;
    mp.spin = playing ? Math.min(1.4, (mp.spin || 0) + .35) : (mp.spin || 0) * .9 < .01 ? 0 : (mp.spin || 0) * .9;
    const dt = now - (mp.coverAt || now);
    mp.angle = ((mp.angle || 0) + (mp.spin || 0) * dt / 70) % 360; mp.coverAt = now;
    mp.deckAng = ((mp.deckAng || 0) + (mp.spin || 0) / 1.4 * MU_RPM * dt / 1000) % 360;
  }
  function muDrawCover(now) {
    const cv = $('muCover'), r = cv.getBoundingClientRect(), k = devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k);
    if (!w || !h) return;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.clearRect(0, 0, w, h);
    if (mu.settings.vinyl) return muDeck(g, w, h, now, !!(muAudio && !muAudio.paused));
    const W = Math.min(w, h), fade = mp.coverOld ? Math.min(1, (now - mp.fadeAt) / 180) : 1;
    const paint = (img, alpha) => {
      g.globalAlpha = alpha;
      if (img) { const s = Math.min(img.width, img.height); g.imageSmoothingQuality = 'high'; g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, W * .03, W * .03, W * .94, W * .94); }
      else { g.fillStyle = T.CARD_ALT; g.fillRect(W * .03, W * .03, W * .94, W * .94); g.fillStyle = T.ACCENT; g.font = `bold ${Math.round(W * .3)}px Consolas`; g.textAlign = 'center'; g.fillText('?', W / 2, W / 2 + W * .1); }
      g.globalAlpha = 1;
    };
    if (fade < 1 && mp.coverOld) paint(mp.coverOld.img, 1 - fade); else mp.coverOld = null;
    paint(mp.coverImg, fade);
  }
  function muProgressEvents() {
    const cv = $('muProgress'), at = e => { const r = cv.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (muAudio?.duration || mp.length); };
    cv.onpointerdown = e => { if (!mp.cur) return; cv.setPointerCapture(e.pointerId); mp.seeking = at(e); muDrawProgress(); };
    cv.onpointermove = e => { if (!mp.cur || !(muAudio?.duration || mp.length)) return; mp.preview = at(e); if (mp.seeking != null) mp.seeking = mp.preview; muDrawProgress(); };
    cv.onpointerup = e => { if (mp.seeking == null) return; const s = at(e); mp.seeking = null; muSeek(s); };
    cv.onpointerleave = () => { mp.preview = null; muDrawProgress(); };
  }
  function muDrawProgress(geom) {
    const cv = $('muProgress'); if (!cv) return;
    const w = Math.round(cv.clientWidth * devicePixelRatio), h = Math.round(36 * devicePixelRatio);
    if (geom || cv.width !== w) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'), dur = muAudio?.duration || mp.length || 0, pos = mp.seeking ?? mp.preview ?? (muAudio?.currentTime || mp.resume || 0);
    const ratio = dur ? Math.max(0, Math.min(1, pos / dur)) : 0, k = devicePixelRatio;
    g.clearRect(0, 0, w, h);
    $('muTime').textContent = muClock(pos) + ' / ' + muClock(dur);
    const levels = mu.settings.waveform && mp.cur ? muCache[muId(mp.cur)]?.w : null;
    if (mu.settings.pixelUi) {  // pixel mode: blocks snapped to a 3-px grid, stepped heights, light cap on the played part, a blinking playhead block
      const P = 3 * k, rows = Math.floor(h / P), cols = Math.floor(w / (2 * P)), mid = rows / 2, done = Math.floor(cols * ratio);
      if (!levels) {  // no waveform: a chunky bar of 4-row blocks with a lit top row, a dark foot row and a white playhead block
        const y0 = Math.round((rows - 4) / 2 * P);
        for (let i = 0; i < cols; i++) {
          const played = i < done, x = i * 2 * P;
          for (let r = 0; r < 4; r++) { g.fillStyle = played ? (r === 0 ? muBlend(T.ACCENT, '#ffffff', .55) : r === 3 ? muShade(T.ACCENT, -.35) : T.ACCENT) : (r === 0 ? muBlend(T.CARD_ALT, T.ACCENT, .3) : r === 3 ? muShade(T.CARD_ALT, -.3) : T.CARD_ALT); g.fillRect(x, y0 + r * P, P * 2, P); }
        }
        if (dur) { g.fillStyle = '#ffffff'; g.fillRect(Math.min(cols - 1, done) * 2 * P - P / 2, y0 - P, 2 * P, 6 * P); }
        return;
      }
      for (let i = 0; i < cols; i++) {
        const lv = levels ? levels[Math.min(levels.length - 1, Math.floor(i * levels.length / cols))] : .12, half = Math.max(1, Math.round(lv * mid)), x = i * 2 * P, played = i < done;
        for (let r = 0; r < half * 2; r++) {
          const edge = r === 0 || r === half * 2 - 1;
          g.fillStyle = played ? (edge ? muBlend(T.ACCENT, '#ffffff', .55) : r < half ? T.ACCENT : muShade(T.ACCENT, -.25)) : (edge ? muBlend(T.CARD_ALT, T.ACCENT, .35) : T.CARD_ALT);
          g.fillRect(x, Math.round((mid - half + r) * P), P, P);
        }
      }
      if (dur && (Math.floor(Date.now() / 450) & 1 || !muAudio || muAudio.paused)) { g.fillStyle = '#ffffff'; g.fillRect(Math.min(cols - 1, done) * 2 * P - P / 2, 0, P, rows * P); }
      return;
    }
    if (!levels) {  // a plain bar, like MuPlayer without a waveform
      g.fillStyle = T.CARD_ALT; g.fillRect(0, h / 2 - 3 * k, w, 6 * k); g.fillStyle = T.ACCENT; g.fillRect(0, h / 2 - 3 * k, w * ratio, 6 * k); return;
    }
    const bw = 3 * k, gap = 2 * k, n = Math.max(1, Math.floor(w / (bw + gap)));
    for (let i = 0; i < n; i++) {
      const lv = levels[Math.min(levels.length - 1, Math.floor(i * levels.length / n))], bh = 3 * k + lv * (h - 3 * k), x = i * (bw + gap);
      g.fillStyle = x <= w * ratio ? T.ACCENT : T.CARD_ALT; g.fillRect(x, (h - bh) / 2, bw, bh);
    }
  }
  /* ---------- spectrum: 24 bands spread evenly over the octaves (40 Hz - 14 kHz), compared to the loudest one (MuPlayer's AGC) ---------- */
  const MU_SPEC_N = 24, MU_SPEC_EDGES = Array.from({length: MU_SPEC_N + 1}, (_, i) => 40 * 350 ** (i / MU_SPEC_N));
  const muSpec = {levels: Array(MU_SPEC_N).fill(0), ref: 1e-6, blockAt: 0, db: null};
  // every 64 ms like MuPlayer's spectrum_worker: the energy of each band (power summed over its bins, so the wide high bands are not
  // starved), +1.5 dB per octave because music carries less energy up high, divided by a slowly falling reference = the loudest band;
  // then fast attack / soft release (old * .6 + new * .4). Only the bands that really sound rise.
  function muSpectrumBlock() {
    const a = muNodes.analyser, db = muSpec.db ||= new Float32Array(a.frequencyBinCount), hz = muCtx.sampleRate / a.fftSize;
    a.getFloatFrequencyData(db);
    const mags = [];
    for (let b = 0; b < MU_SPEC_N; b++) {
      const lo = MU_SPEC_EDGES[b], hi = MU_SPEC_EDGES[b + 1], j0 = Math.max(1, Math.round(lo / hz)), j1 = Math.max(j0 + 1, Math.round(hi / hz));
      let p = 0;
      for (let j = j0; j < j1; j++) p += 10 ** (db[j] / 10) || 0;
      mags.push(Math.sqrt(p) * 1.19 ** Math.log2(Math.sqrt(lo * hi) / 40));
    }
    muSpec.ref = Math.max(muSpec.ref * .995, ...mags, 1e-6);
    // hearing-like curve (quiet bands still show) with a gate: under 6 % of the loudest band a bar stays down, so nothing rises for nothing
    muSpec.levels = mags.map((m, i) => { const r = m / muSpec.ref, n = r < .06 ? 0 : Math.min(1, ((r - .06) / .94) ** .55), o = muSpec.levels[i]; return n > o ? n : o * .6 + n * .4; });
  }
  // pixel-art bars, drawn at the size of the art pixels then scaled up without smoothing: each bar has 4 colour tiers from its foot to
  // its top (dithered where they meet), a light left edge and a dark right edge for the relief, a bright cap, a peak marker that holds
  // then falls, a hard pixel drop shadow (1 then 2 pixels down-right, the second fainter), and a faint dotted grid behind.
  // Hue sweeps ACCENT -> DANGER -> ACCENT_2 like MuPlayer.
  // SUPER VISUALISER (level 100): taller, hue that drifts along the bars, light-to-bright bars with a bright cap, glow, a mirrored fading reflection,
  // a floor line that pulses with the bass and sparks that fly off the peaks
  function muSuperSpectrum(cv, cssH, now) {
    const avail = cv.parentElement?.clientWidth || 0; if (!avail) return;
    const P = Math.max(2, Math.round(3 * devicePixelRatio)) / devicePixelRatio, cols = Math.floor(avail / P), rows = Math.floor(cssH / P);
    if (cv.width !== cols || cv.height !== rows) { cv.width = cols; cv.height = rows; cv.style.width = cols * P + 'px'; cv.style.height = rows * P + 'px'; }
    const g = cv.getContext('2d'), playing = muAudio && !muAudio.paused, t = now / 1000, L = muSpec.levels;
    const N = Math.max(16, Math.min(64, Math.floor(cols / 5))), bw = Math.floor(cols / N), inner = Math.max(2, bw - 1), off = Math.floor((cols - N * bw) / 2) + Math.floor((bw - inner) / 2);
    const Hb = Math.floor(rows * .66), base = 2 + Hb, refl = rows - base - 1;
    const s = cv._sup ||= {}; if (s.n !== N) Object.assign(s, {n: N, display: Array(N).fill(0), peaks: Array(N).fill(0), sparks: [], pulse: 0});
    const dt = Math.min(.1, (now - (s.at || now)) / 1000); s.at = now;
    s.pulse = Math.max(playing && (L[0] + L[1] + L[2]) / 3 > .55 ? 1 : 0, s.pulse - dt * 4);
    const down = 1 - .0005 ** dt, hue = f => { f = (f % 1 + 1) % 1; return f < 1 / 3 ? muBlend(T.ACCENT, T.DANGER, f * 3) : f < 2 / 3 ? muBlend(T.DANGER, T.ACCENT_2, f * 3 - 1) : muBlend(T.ACCENT_2, T.ACCENT, f * 3 - 2); };
    g.clearRect(0, 0, cols, rows);
    g.fillStyle = muBlend(T.CARD_ALT, T.ACCENT, .3 + .6 * s.pulse); g.fillRect(0, base, cols, 1);
    for (let i = 0; i < N; i++) {
      const pos = i / Math.max(1, N - 1) * (L.length - 1), lo = Math.floor(pos), hi = Math.min(L.length - 1, lo + 1);
      const raw = playing ? Math.max(0, Math.min(1, L[lo] * (1 - (pos - lo)) + L[hi] * (pos - lo))) : 0, target = playing ? raw : .04 + .03 * Math.sin(t * 2 + i * .45);
      s.display[i] = target > s.display[i] ? target : s.display[i] + (target - s.display[i]) * down; if (!(s.display[i] >= 0)) s.display[i] = 0;
      s.peaks[i] = Math.max(raw, s.peaks[i] - dt * .8);
      const x = off + i * bw, h = Math.max(1, Math.min(Hb, Math.round(s.display[i] * Hb))), col = hue(i / Math.max(1, N - 1) * .9 + t * .06);
      if (raw > .45 && raw >= s.peaks[i] - 1e-4 && s.sparks.length < 140 && Math.random() < .3) s.sparks.push({x: x + inner / 2, y: base - h, vx: (Math.random() - .5) * 14, vy: -(8 + Math.random() * 18), life: 1, c: muBlend(col, '#ffffff', .6)});
      g.globalAlpha = .13 + .1 * s.pulse; g.fillStyle = col; g.fillRect(x - 1, base - h - 1, inner + 2, h + 2); g.globalAlpha = 1;
      for (let r = 0; r < h; r++) { g.fillStyle = muBlend(col, '#ffffff', r / Hb * .45); g.fillRect(x, base - 1 - r, inner, 1); }
      if (inner > 2) { g.fillStyle = muBlend(col, '#ffffff', .5); g.fillRect(x, base - h, 1, h); g.fillStyle = muShade(col, -.35); g.fillRect(x + inner - 1, base - h, 1, h); }
      g.fillStyle = muBlend(col, '#ffffff', .85); g.fillRect(x, base - h - 1, inner, 1);
      const py = base - 2 - Math.round(s.peaks[i] * Hb); if (py < base - h - 3) { g.fillStyle = muBlend(col, '#ffffff', .6); g.fillRect(x, py, inner, 1); }
      for (let r = 0; r < Math.min(h, refl); r++) { g.globalAlpha = .34 * (1 - r / Math.max(1, refl)) ** 1.6; g.fillStyle = muBlend(col, '#ffffff', r / Hb * .3); g.fillRect(x, base + 1 + r, inner, 1); }
      g.globalAlpha = 1;
    }
    s.sparks = s.sparks.filter(p => (p.life -= dt * 1.5) > 0 && p.y < base + 1);
    for (const p of s.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 38 * dt; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
    g.globalAlpha = 1;
  }
  const muSuperOn = now => { if (now - (mp.supAt || -1e9) > 2000) { mp.supAt = now; mp.supOn = !!mu.settings.superVis && muLevel().level >= 100; } return mp.supOn; };
  function muPixSpectrum(cv, cssH, now) {
    const avail = cv.parentElement?.clientWidth || 0; if (!avail) return;
    const P = Math.max(2, Math.round(3 * devicePixelRatio)) / devicePixelRatio, cols = Math.floor(avail / P), rows = Math.floor(cssH / P);
    if (cv.width !== cols || cv.height !== rows) { cv.width = cols; cv.height = rows; cv.style.width = cols * P + 'px'; cv.style.height = rows * P + 'px'; }
    const s = cv._s ||= {}, g = cv.getContext('2d'), playing = muAudio && !muAudio.paused;
    const N = Math.max(12, Math.min(48, Math.floor(cols / 6))), bw = Math.floor(cols / N), inner = Math.max(2, bw - (bw > 4 ? 2 : 1)), off = Math.floor((cols - N * bw) / 2) + Math.floor((bw - inner) / 2);
    const base = rows - 2, Hb = base;  // the 2 last rows hold the shadow
    if (s.n !== N) { s.n = N; s.display = Array(N).fill(0); s.peaks = Array(N).fill(0); s.peakAt = Array(N).fill(0); s.key = ''; }
    if (s.key !== T.ACCENT + T.DANGER + T.ACCENT_2) {
      s.key = T.ACCENT + T.DANGER + T.ACCENT_2;
      s.cols = Array.from({length: N}, (_, i) => {
        const f = i / Math.max(1, N - 1), hue = f < .5 ? muBlend(T.ACCENT, T.DANGER, f * 2) : muBlend(T.DANGER, T.ACCENT_2, f * 2 - 1);
        const tiers = [muShade(hue, -.38), muShade(hue, -.15), hue, muBlend(hue, '#ffffff', .3)];
        return {tiers: tiers.map(c => [c, muBlend(c, '#ffffff', .25), muShade(c, -.38)]), cap: muBlend(hue, '#ffffff', .7), peak: muBlend(hue, '#ffffff', .5)};
      });
    }
    const dt = Math.min(.25, (now - (s.at || now)) / 1000); s.at = now;
    const per = r => 1 - (1 - r) ** (dt / .25), up = per(.92), down = per(.25), fall = .55 ** (dt / .25), t = now / 1000, L = muSpec.levels;
    g.clearRect(0, 0, cols, rows);
    g.fillStyle = T.CARD_ALT;
    for (const q of [.25, .5, .75]) { const y = base - 1 - Math.round(q * (Hb - 1)); for (let x = (y & 1) * 2; x < cols; x += 4) g.fillRect(x, y, 1, 1); }  // dotted grid
    for (let i = 0; i < N; i++) {
      const pos = i / Math.max(1, N - 1) * (L.length - 1), lo = Math.floor(pos), hi = Math.min(L.length - 1, lo + 1);
      const raw = playing ? Math.max(0, Math.min(1, L[lo] * (1 - (pos - lo)) + L[hi] * (pos - lo))) : 0;
      const target = playing ? raw : .05 + .04 * (1 + Math.sin(t * 2.2 + i * .5)) / 2;  // at rest: a slow breathing wave instead of a flat line
      s.display[i] = target > s.display[i] ? target : s.display[i] + (target - s.display[i]) * down; if (!(s.display[i] >= 0)) s.display[i] = 0;
      if (raw >= s.peaks[i]) { s.peaks[i] = raw; s.peakAt[i] = t; } else if (t - s.peakAt[i] > .12) s.peaks[i] *= fall;
      const c = s.cols[i], x = off + i * bw, h = Math.max(1, Math.min(Hb, Math.round(s.display[i] * Hb)));
      const top = base - h, py = s.peaks[i] > .06 ? base - 1 - Math.min(Hb - 1, Math.round(s.peaks[i] * Hb)) : -1, peak = py >= 0 && py < top;
      g.fillStyle = 'rgba(0, 0, 0, .2)'; g.fillRect(x + 2, top + 2, inner, h); if (peak) g.fillRect(x + 2, py + 2, inner, 1);  // drop shadow
      g.fillStyle = 'rgba(0, 0, 0, .42)'; g.fillRect(x + 1, top + 1, inner, h); if (peak) g.fillRect(x + 1, py + 1, inner, 1);
      for (let r = 0; r < h; r++) {
        const y = base - 1 - r, tier = Math.min(3, Math.floor(r / Hb * 4)), edge = tier > 0 && Math.floor((r - 1) / Hb * 4) < tier;
        const [main, light, dark] = c.tiers[tier];
        if (r === h - 1 && h > 1) { g.fillStyle = c.cap; g.fillRect(x, y, inner, 1); continue; }
        g.fillStyle = main; g.fillRect(x, y, inner, 1);
        if (edge) { g.fillStyle = c.tiers[tier - 1][0]; for (let k = (y & 1); k < inner; k += 2) g.fillRect(x + k, y, 1, 1); }  // dither between tiers
        if (inner > 2) { g.fillStyle = light; g.fillRect(x, y, 1, 1); g.fillStyle = dark; g.fillRect(x + inner - 1, y, 1, 1); }
      }
      if (peak) { g.fillStyle = c.peak; g.fillRect(x, py, inner, 1); }
    }
  }

  /* ---------- portable player: when NeoMusic's tab is left while a song plays, a small player stays in a corner of NeoDex ---------- */
  const MU_PIX = {
    prevt: ['##....#', '##...##', '##..###', '##.####', '##..###', '##...##', '##....#'],
    heart: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  };
  const muPixIcon = k => pixIcon(MU_PIX[k] || PIX[k]);
  function muMiniBuild() {
    const btn = (id, icon, title, fn) => mh('button.mmBtn#' + id, {title, html: muPixIcon(icon), onclick: e => { e.stopPropagation(); fn(); setTimeout(muMiniPaint, 80); }});
    const box = mh('div.muMini#muMini', {title: 'Glisser : déplacer · Clic : pause / lecture · Double-clic : revenir à NeoMusic · Molette : volume'},
      mh('canvas#mmDisc', {width: 184, height: 184}),
      mh('div.mmBody', {},
        mh('div.mmTop', {}, mh('span.mmKick', {text: 'NEOMUSIC'}), mh('span#mmState'),
          btn('mmBack', 'ext', 'Revenir à NeoMusic', () => muShowTab()), btn('mmClose', 'close', 'Fermer (met la musique en pause)', () => { muPause(); mp.miniOff = true; muMiniSync(); })),
        mh('b#mmTitle'), mh('span#mmArtist'),
        mh('div.mmSpecBox', {}, mh('canvas#mmSpec')),
        mh('div.mmBar', {}, mh('div#mmSeek', {title: 'Aller à ce moment'}, mh('i')), mh('span#mmTime')),
        mh('div.mmCtl', {}, btn('mmPrev', 'prevt', 'Morceau précédent', () => muPrev()), btn('mmPlay', 'pause', 'Lecture / pause', () => muToggle()), btn('mmNext', 'next', 'Morceau suivant', () => muNext()),
          btn('mmFav', 'heart', 'Favori', () => muToggleFav()), mh('span#mmVol'))));
    box.querySelector('#mmSeek').onclick = e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); muSeek((e.clientX - r.left) / r.width * (muAudio?.duration || mp.length)); };
    box.onwheel = e => { e.preventDefault(); muSetVolume(mu.settings.volume + (e.deltaY < 0 ? .05 : -.05)); muMiniPaint(); };
    box.ondblclick = e => { if (!e.target.closest('button, #mmSeek')) muShowTab(); };
    box.onpointerdown = e => {  // drag to move (remembered), a plain click = pause / play, like the video mini player
      if (e.button || e.target.closest('button, #mmSeek')) return;
      const sx = e.screenX, sy = e.screenY, o = {...mp.miniPos}; let moved = false;
      box.setPointerCapture(e.pointerId);
      box.onpointermove = m => { if (!moved && Math.hypot(m.screenX - sx, m.screenY - sy) < 4) return; moved = true; box.classList.add('drag'); mp.miniPos = {x: o.x + m.screenX - sx, y: o.y + m.screenY - sy}; muMiniPlace(); };
      box.onpointerup = () => { box.onpointermove = box.onpointerup = null; box.classList.remove('drag'); if (moved) { try { localStorage.neoMusicMini = JSON.stringify(mp.miniPos); } catch {} } else { muToggle(); setTimeout(muMiniPaint, 80); } };
    };
    try { mp.miniPos = JSON.parse(localStorage.neoMusicMini || 'null'); } catch {}
    document.body.append(box);
    addEventListener('resize', () => mp.miniOn && muMiniPlace());
  }
  function muShowTab() { newTab('plugin:neodex.music'); }
  function muMiniPlace() {
    const box = $('muMini'), w = box.offsetWidth || 430, h = box.offsetHeight || 118;
    if (host.float) {  // dans le bac à sable de NeoDex : c'est la frame entière qui flotte dans un coin de NeoDex, NeoDex la garde dans la fenêtre
      const at = mp.miniPos; host.float({w, h, x: at?.x, y: at?.y}).then(p => { if (p && mp.miniOn) mp.miniPos = p; }).catch(() => {}); return;
    }
    if (!mp.miniPos) {  // first time: bottom right, above the video mini player if one is shown
      const vid = document.body.classList.contains('hasMini') ? parseFloat(getComputedStyle(document.body).getPropertyValue('--my')) : NaN;
      mp.miniPos = {x: innerWidth - w - 24, y: (isFinite(vid) ? vid - 18 : document.body.clientHeight - 24) - h};
    }
    mp.miniPos = {x: Math.round(Math.min(Math.max(mp.miniPos.x, 0), innerWidth - w)), y: Math.round(Math.min(Math.max(mp.miniPos.y, 46), document.body.clientHeight - h))};
    box.style.left = mp.miniPos.x + 'px'; box.style.top = mp.miniPos.y + 'px';
  }
  // shown when NeoMusic's tab is not the one on screen and a song plays (then it stays while paused); its X pauses and hides it until NeoMusic is shown again
  function muMiniSync() {
    const box = $('muMini'); if (!box) return;
    const away = !view.classList.contains('on'), playing = muAudio && !muAudio.paused && muAudio.currentTime > 0;  // sound really came out: a song still loading or that never started is no reason to appear
    if (!away) mp.miniOff = false;
    const show = away && !!mp.cur && !mp.miniOff && host.pref('pip') !== false && (playing || mp.miniOn);
    const appear = show && !mp.miniOn;
    box.classList.toggle('on', show);
    if (host.float && show !== mp.miniOn) { document.body.classList.toggle('mmFloat', show); if (!show) host.float(null).catch(() => {}); }
    mp.miniOn = show;
    if (appear) { muMiniPaint(); muMiniPlace(); }  // filled first: its height is only known with its text
    if (show) muMiniPaint();
  }
  function muMiniPaint() {
    if (!mp.miniOn || !mp.cur) return;
    const t = mp.cur, playing = muAudio && !muAudio.paused, fav = muIsFav(t);
    $('mmTitle').textContent = t.display_title || t.file; $('mmArtist').textContent = t.author || muPlaylistOf(t)?.name || '';
    $('mmState').textContent = playing ? '· LECTURE' : '· PAUSE'; $('mmState').style.color = playing ? T.ACCENT_2 : T.WARN;
    $('mmPlay').innerHTML = muPixIcon(playing ? 'pause' : 'play');
    $('mmFav').classList.toggle('on', fav); $('mmFav').title = fav ? 'Retirer des favoris' : 'Ajouter aux favoris';
    $('mmVol').textContent = 'VOL ' + Math.round(mu.settings.volume * 100) + ' %';
  }
  function muMiniFrame(now) {
    const cv = $('mmDisc'), g = cv.getContext('2d'), W = cv.width;
    g.clearRect(0, 0, W, W);
    if (mu.settings.vinyl) {
      const b = muPixBuf('pxMini', 46, 46), {disc} = muPixKit(b);  // le même disque en pixels, cerclé de la couleur du thème
      disc(23, 23, 22, muCol(T.ACCENT)); muPixRecord(b, 23, 23, 20, mp.deckAng || 0, mp.coverImg); muPixShow(g, b, W, W, 4);
    } else if (mp.coverImg) { const im = mp.coverImg, s = Math.min(im.width, im.height); g.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, W, W); }
    else { g.fillStyle = T.CARD_ALT; g.fillRect(0, 0, W, W); g.fillStyle = T.ACCENT; g.font = 'bold 80px Consolas'; g.textAlign = 'center'; g.fillText('?', W / 2, W / 2 + 28); }
    const sup = muSuperOn(now); $('mmSpec').parentElement.classList.toggle('sup', sup);  // the super visualiser follows into the portable player
    if (sup) muSuperSpectrum($('mmSpec'), 39, now); else muPixSpectrum($('mmSpec'), 21, now);
    const dur = muAudio?.duration || mp.length || 0, pos = muAudio?.currentTime || mp.resume || 0;
    $('mmSeek').firstChild.style.width = (dur ? Math.min(100, pos / dur * 100) : 0) + '%';
    $('mmTime').textContent = muClock(pos) + ' / ' + muClock(dur);
  }
  function muFrame(now) {
    requestAnimationFrame(muFrame);
    const main = view.classList.contains('on');
    if (document.hidden || (!main && !mp.miniOn)) return;  // nothing on screen: no drawing at all (the music still plays)
    if (muAudio && !muAudio.paused && muNodes) { if (now - muSpec.blockAt >= 64) { muSpec.blockAt = now; muSpectrumBlock(); } }
    else muSpec.ref = 1e-6;
    muSpin(now);
    if (main) {
      muDrawCover(now); if (mu.settings.visualizer) muSuperOn(now) ? muSuperSpectrum($('muSpectrum'), 112, now) : muPixSpectrum($('muSpectrum'), 64, now);
      if (muAudio && !muAudio.paused && now - (mp.progAt || 0) > 120) { mp.progAt = now; muDrawProgress(); }
    } else muMiniFrame(now);
  }

  /* ---------- listening time, levels, session (every 250 ms like MuPlayer's update_clock) ---------- */
  function muClockTick() {
    if (!muAudio || muAudio.paused || !mp.cur) return;
    const now = performance.now();
    if (mp.lastTick) {
      const s = Math.min(.5, Math.max(0, (now - mp.lastTick) / 1000)), st = mu.stats, title = mp.cur.display_title || '', artist = mp.cur.author || 'Inconnu';
      st.seconds = (+st.seconds || 0) + s;
      st.songs_time[title] = (+st.songs_time[title] || 0) + s; st.artists_time[artist] = (+st.artists_time[artist] || 0) + s;
      muLevelCheck();
      if (now - mp.saveAt > 15000) { mp.saveAt = now; muSaveSession(false); muSave(500); }
    }
    mp.lastTick = now;
    if (mp.sleepAt && Date.now() >= mp.sleepAt) muSleepCountdown();
  }
  function muSaveSession(save = true) {
    if (!mp.cur) return;
    mu.session = {playlist: muPlaylistOf(mp.cur)?.name || mp.pl, id: muId(mp.cur), position: muAudio ? muAudio.currentTime : mp.resume};
    if (save) muSave();
  }
  function muRestoreSession() {
    const s = mu.session; if (!s?.id) return;
    const p = muPl(s.playlist), t = p?.tracks.find(x => muId(x) === s.id); if (!t) return;
    mp.cur = t; mp.queue = p.tracks.slice(); mp.resume = Math.max(0, +s.position || 0); mp.length = muDur(t); mp.paused = true;
    $('muTitle').textContent = t.display_title || t.file; muFitTitle();
    muSetCover(t); muFavButton(); muDrawProgress(true);
    const i = mp.view.findIndex(x => x === t); if (i >= 0) { mp.sel = new Set([i]); mp.anchor = i; muDraw(); }
  }

  /* ---------- status line (title bar) ---------- */
  function muStatus(text, color) {
    clearInterval(mp.statusTimer); mp.statusTimer = null;
    const el = $('muStatus'); if (!el) return;
    el.style.color = color || T.WARN;
    if (!/^Téléchargement \d/.test(text)) muProgressBar(0);
    if (/\.\.\.$/.test(text) || /attente/i.test(text)) {  // the "..." of a long task moves
      const base = text.replace(/\.+$/, ''); let n = 1;
      el.textContent = '●  ' + base + '.';
      mp.statusTimer = setInterval(() => { n = n >= 3 ? 1 : n + 1; el.textContent = '●  ' + base + '.'.repeat(n); }, 450);
    } else el.textContent = '●  ' + text;
  }
  function muProgressBar(p) { const b = $('muDl'); if (b) b.style.width = Math.max(0, Math.min(100, p)) + '%'; }

  /* ---------- favourites, adding, deleting (to the 7-day trash) ---------- */
  function muToggleFav(t = mp.cur) {
    if (!t) return;
    const fav = muPl('Favoris'), id = muId(t), i = fav.tracks.findIndex(x => muId(x) === id);
    if (i >= 0) { fav.tracks.splice(i, 1); muStatus('Retiré des favoris'); }
    else {
      const copy = {...t}; delete copy.last_played;
      fav.tracks.push(copy); muStatus('Ajouté aux favoris', T.HEART);
      if (!copy.file && copy.url) muQueue(() => muDownloadInto(copy).then(() => muSave()).catch(e => muWarn('favori', e)));  // Favoris is offline: the song is downloaded
      muFavAchievements();
    }
    muSave(); mp.favs = muFavIds(); muFavButton(); if (mp.pl === 'Favoris') muRefresh(); else muDraw();
  }
  function muAddTracksTo(list, name) {
    const p = muPl(name), have = new Set(p.tracks.map(muId)); let n = 0;
    for (const t of list) {
      if (have.has(muId(t))) { if (list.length === 1) muStatus(`Déjà présent dans « ${name} »`); continue; }
      const copy = {...t};
      if (p.mode === 'online') { if (!copy.url) { muNotify('error', 'Ajout', 'Cette musique n\'a pas de source en ligne disponible.'); continue; } copy.is_online = true; copy.duration = muDur(t); }
      else if (!copy.file && copy.url) muQueue(() => muDownloadInto(copy, name).then(() => muSave()).catch(e => muWarn('ajout', e)));
      p.tracks.push(copy); have.add(muId(t)); n++;
    }
    if (!n) return;
    if (name === 'Favoris') muFavAchievements();
    muSizeAchievement(p);
    muSave(); mp.favs = muFavIds(); if (mp.pl === name) muRefresh(); else muDraw();
    muStatus(n > 1 ? `${n} musiques ajoutées à « ${name} »` : `Ajouté à « ${name} »`);
  }
  function muDeleteSelection() { muDeleteTracks([...mp.sel].sort((a, b) => a - b).map(i => mp.view[i])); }
  function muDeleteTracks(list) {
    const p = muPl(mp.pl);
    for (const t of list) {
      const i = p.tracks.indexOf(t); if (i < 0) continue;
      p.tracks.splice(i, 1);
      mu.trash.push({item: t, playlist: p.name, title: t.display_title || t.file, deleted_at: Date.now() / 1000});
    }
    mp.sel.clear(); muSave(); mp.favs = muFavIds(); muRefresh();
    muStatus(list.length > 1 ? list.length + ' musiques à la corbeille' : 'Musique à la corbeille');
  }
  function muUsedElsewhere(file) { return !!file && (mu.playlists.some(p => p.tracks.some(t => t.file === file)) || mu.trash.some(e => e.item?.file === file)); }
  function muCleanupTrash() {  // 7 days later the entry goes, and its file too if nothing else uses it
    const now = Date.now() / 1000, keep = [], drop = [];
    for (const e of mu.trash) (now - (+e.deleted_at || now) >= 7 * 86400 ? drop : keep).push(e);
    if (!drop.length) return;
    mu.trash = keep;
    for (const e of drop) if (e.item?.file && !muUsedElsewhere(e.item.file)) neo.musicDeleteFile(e.item.file);
    muSave();
  }

  /* ---------- background jobs one after the other (downloads), with the progress line in the title bar ---------- */
  function muQueue(job) { const p = mp.busyQueue.then(job, job); mp.busyQueue = p.catch(() => {}); return p; }
  let muDlId = 0;
  neo.onMusicProgress?.(d => { if (d.id === mp.dlId) { muProgressBar(d.p); $('muStatus').textContent = '●  Téléchargement ' + Math.round(d.p) + '%'; $('muStatus').style.color = T.ACCENT_2; } });
  async function muDownload(url) {
    mp.dlId = ++muDlId; muStatus('Téléchargement 0%', T.ACCENT_2); muProgressBar(0);
    const r = await neo.musicDownload(url, mp.dlId);
    muProgressBar(100); muStatus('Conversion audio...', T.ACCENT_2);
    mp.exists[r.file] = true;
    return r;
  }
  async function muDownloadInto(t) {  // gives an online entry its own file on this PC
    const r = await muDownload(t.url);
    t.file = r.file; t.is_online = false; if (!t.cover && r.cover) t.cover = r.cover; if (!t.duration) t.duration = r.duration;
    muStatus('Musique téléchargée'); muDraw();
    return t;
  }
  // The library comes through the sync, the mp3 do not: every offline song this PC does not have yet is downloaded in the background,
  // one after the other, at launch and whenever another PC changes the library. Same YouTube id = same file name on every PC.
  const muSyncing = new Set();
  async function muSyncFiles() {
    if (!mu) return;
    const offline = mu.playlists.filter(p => p.mode === 'offline').flatMap(p => p.tracks).concat(mu.trash.map(e => e.item).filter(Boolean));
    const names = [...new Set(offline.map(t => t.file).filter(Boolean))];
    if (names.length) Object.assign(mp.exists, await neo.musicExists(names));
    const urls = [...new Set(offline.filter(t => t.url && (!t.file || mp.exists[t.file] === false)).map(t => t.url))].filter(u => !muSyncing.has(u));
    if (!urls.length) return 0;
    muCaps ||= await neo.musicCaps().catch(() => muDefaultCaps);
    if (!muCaps.ytdlp) return muWarn('synchro', urls.length + ' musique(s) à télécharger, mais yt-dlp n\'est pas installé'), 0;
    urls.forEach(u => muSyncing.add(u));
    let done = 0;
    for (const url of urls) muQueue(async () => {
      try {
        const r = await muDownload(url);
        for (const t of mu.playlists.flatMap(p => p.mode === 'offline' ? p.tracks : []).concat(mu.trash.map(e => e.item).filter(Boolean))) if (t.url === url) { t.file = r.file; t.is_online = false; if (!t.cover && r.cover) t.cover = r.cover; }
        done++; muSave(); muDraw();
        muStatus(done === urls.length ? `Synchro : ${done} musique(s) téléchargée(s) sur ce PC` : `Synchro : ${done} / ${urls.length} musiques`, T.ACCENT_2);
      } catch (e) { muWarn('synchro', e); }
      finally { muSyncing.delete(url); }
    });
    return urls.length;
  }

  /* ---------- NeoDex glue: global shortcuts, the tab ---------- */
  function muHotkeys() {
    const map = {};
    for (const [key, , , def] of MU_SHORTCUTS) map[key] = key in mu.settings.shortcuts ? mu.settings.shortcuts[key] : def;
    neo.musicHotkeys?.(map).then(failed => { if (failed?.length) muWarn('raccourcis', 'déjà pris par une autre appli : ' + failed.join(', ')); });
  }
  const MU_ACTIONS = {toggle: () => muToggle(), prev: () => muPrev(), next: () => muNext(), volUp: () => muSetVolume(mu.settings.volume + .05), volDown: () => muSetVolume(mu.settings.volume - .05),
    mute: () => { if (mu.settings.volume > 0) { mp.beforeMute = mu.settings.volume; muSetVolume(0); muStatus('Son coupé'); } else { muSetVolume(mp.beforeMute || .5); muStatus('Son rétabli'); } },
    fwd: () => muSeek((muAudio?.currentTime || 0) + 10), back: () => muSeek((muAudio?.currentTime || 0) - 10), shuffle: () => muShuffle(), fav: () => muToggleFav(),
    fullscreen: () => neo.win('fs'), mini: () => muMini()};
  neo.onMusicHotkey?.(async action => { await muLoad(); muBuild(); muShortcutAchievement(); MU_ACTIONS[action]?.(); });
  function muMini() {
    mu.settings.mini = !mu.settings.mini; muSave();
    $('mu').classList.toggle('mini', mu.settings.mini);
    muStatus(mu.settings.mini ? 'Mode petit lecteur activé' : 'Mode normal restauré');
    muDraw();
  }
  neo.onDataChanged?.(name => {  // another PC changed the library: take it, keep playing what plays
    if (name !== 'music' || !mu) return;
    neo.musicLoad().then(d => { const id = muId(mp.cur); mu = muRepair(d); if (mp.built) { muApplyTheme(); muApplySettingsUi(); muLoadPlaylist(muPl(mp.pl) ? mp.pl : 'Favoris'); } muHotkeys(); for (const p of mu.playlists) { const t = p.tracks.find(x => muId(x) === id); if (t) { mp.cur = t; break; } } muSyncFiles(); });
  });
  addEventListener('beforeunload', () => { if (mu) { if (mp.cur) muSaveSession(false); clearTimeout(muSaveTimer); neo.musicSave(mu); } });
  async function muOpen() {
    await muLoad();
    muBuild();
    muDraw(); muDrawProgress(true); muFitTitle();
  }
  muLoad().catch(e => muWarn('chargement', e));
  /* NeoMusic, part 2: MuPlayer's windows and dialogs (Options, Statistiques, Succès, Corbeille, Artistes à découvrir, imports...),
     recommendations and weekly playlists, sleep mode and alarm, levels and achievements, MuPlayer folder import. */

  /* ---------- dialogs: secondary windows (title bar with accent strip), ModernDialog prompts, NotifyDialog, playlist mode ---------- */
  let muWinZ = 0;
  function muWindow(title, width) {
    const layer = $('muLayer'), mu0 = $('mu');
    const w = Math.max(width || 620, Math.round(mu0.clientWidth / 2));
    const win = mh('div.muWin', {style: {width: Math.min(w, mu0.clientWidth) + 'px'}});
    const bar = mh('div.muWinBar', {}, mh('i'), mh('b', {text: title.toUpperCase()}), mh('button', {text: 'X', title: 'Fermer', onclick: () => close()}));
    const body = mh('div.muWinBody');
    win.append(bar, body); layer.append(win); win.style.zIndex = ++muWinZ;
    const close = () => { win.remove(); removeEventListener('keydown', esc, true); };
    const esc = e => { if (e.key === 'Escape' && +win.style.zIndex === Math.max(...[...layer.children].map(w => +w.style.zIndex))) { e.stopPropagation(); close(); } };
    addEventListener('keydown', esc, true);
    bar.onpointerdown = e => {  // drag by the title bar, like the Tk windows
      if (e.target.tagName === 'BUTTON') return;
      const x0 = e.clientX - win.offsetLeft, y0 = e.clientY - win.offsetTop; bar.setPointerCapture(e.pointerId);
      bar.onpointermove = ev => { win.style.left = Math.max(0, Math.min(mu0.clientWidth - 80, ev.clientX - x0)) + 'px'; win.style.top = Math.max(0, Math.min(mu0.clientHeight - 40, ev.clientY - y0)) + 'px'; };
      bar.onpointerup = () => { bar.onpointermove = null; };
    };
    win.onpointerdown = () => { if (+win.style.zIndex !== muWinZ) win.style.zIndex = ++muWinZ; };  // a click brings it to the front (moving the node instead would swallow the click)
    return {win, body, close};
  }
  const muH = (text, cls = '') => text.includes('·') ? mh('div.muWH' + cls, {text}) : mh('span.muWHx');  // only the headings that say more than the window title
  const muSec = text => mh('div.muWSec', {text});
  const muNote = text => mh('p.muWNote', {text});
  const muButton = (text, fn, kind = '') => mh('button.muBtn' + (kind ? '.' + kind : ''), {text, onclick: fn});
  function muModal(title, build, titleColor) {  // ModernDialog / NotifyDialog / PlaylistModeDialog: small, centred, modal
    return new Promise(resolve => {
      const shade = mh('div.muShade'), box = mh('div.muDlg');
      const done = v => { shade.remove(); removeEventListener('keydown', key, true); resolve(v); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); done(null); } };
      box.append(mh('div.muDlgBar', {}, mh('b', {text: title.toUpperCase(), style: titleColor ? {color: titleColor} : null}), mh('button', {text: 'X', onclick: () => done(null)})), mh('div.muDlgCard', {}, ...build(done)));
      shade.append(box); $('mu').append(shade);
      addEventListener('keydown', key, true);
      setTimeout(() => box.querySelector('input,button.first')?.focus(), 30);
    });
  }
  function muPrompt(title, prompt, value = '') {
    return muModal(title, done => {
      const input = mh('input.muDlgIn', {value, spellcheck: 'false', onkeydown: e => { if (e.key === 'Enter') done(input.value.trim()); }});
      return [mh('b.muDlgTitle', {text: title}), mh('p', {text: prompt}), input, mh('div.muDlgBtns', {}, muButton('OK', () => done(input.value.trim()), 'accent'), muButton('ANNULER', () => done(null), 'danger'))];
    });
  }
  function muConfirm(title, message) {
    return muModal(title, done => [mh('b.muDlgTitle', {text: title}), mh('p', {text: message}), mh('div.muDlgBtns', {}, muButton('OUI', () => done(true), 'accent first'), muButton('NON', () => done(false), 'danger'))]).then(v => v === true);
  }
  function muNotify(kind, title, message) {
    const [icon, color] = {error: ['✕', T.DANGER], warning: ['⚠', T.WARN], success: ['✓', T.ACCENT_2], info: ['ℹ', T.ACCENT]}[kind] || ['ℹ', T.ACCENT];
    return muModal(icon + '  ' + title, done => [mh('pre.muDlgMsg', {text: message}), mh('div.muDlgBtns', {}, mh('button.muBtn.first', {text: 'OK', style: {color}, onclick: () => done(true)}))], color);
  }
  function muModeDialog() {
    return muModal('Mode de la playlist', done => [mh('b.muDlgTitle.small', {text: 'Comment cette playlist doit-elle gérer la musique ?'}),
      mh('button.muMode', {onclick: () => done('offline')}, mh('b', {text: 'HORS LIGNE'}), mh('span', {text: 'Les musiques ajoutées sont téléchargées et écoutables sans connexion.'})),
      mh('button.muMode.alt', {onclick: () => done('online')}, mh('b', {text: 'EN LIGNE'}), mh('span', {text: 'Rien n\'est téléchargé à part la pochette : la musique est diffusée en streaming au moment de la lecture.'}))]);
  }
  const muDefaultCaps = {ytdlp: '', ffmpeg: false, muplayer: ''};
  let muCaps = null;
  async function muNeedYtdlp() {
    muCaps ||= await neo.musicCaps().catch(() => muDefaultCaps);
    if (muCaps.ytdlp) return true;
    muNotify('error', 'Dépendance manquante', 'yt-dlp n\'est pas installé (il sert aussi à MuPlayer).\n\nCommande : python -m pip install -U yt-dlp');
    return false;
  }

  /* ---------- playlists ---------- */
  async function muNewPlaylist() {
    let name = await muPrompt('Nouvelle playlist', 'Nom de la nouvelle playlist :');
    if (!name) return;
    if (muPl(name)) return muNotify('warning', 'NeoMusic', 'Cette playlist existe déjà.');
    if (MU_SYSTEM.includes(name)) return muNotify('warning', 'NeoMusic', 'Cette playlist est gérée automatiquement par NeoMusic.');
    name = name.replace(/[\\/:*?"<>|]/g, '_').trim(); if (!name) return;
    const mode = await muModeDialog(); if (!mode) return;
    mu.playlists.push({name, mode, tracks: []}); muSave();
    muLoadPlaylist(name); muPlaylistCreated();
    muStatus(mode === 'online' ? 'Playlist créée (en ligne)' : 'Playlist créée (hors ligne)');
  }
  async function muDeletePlaylist() {
    const name = mp.pl;
    if (MU_SYSTEM.includes(name)) return muNotify('warning', 'NeoMusic', 'Cette playlist système ne peut pas être supprimée.');
    if (!await muConfirm('Supprimer', `Supprimer définitivement la playlist « ${name} » ?`)) return;
    const p = muPl(name); mu.playlists = mu.playlists.filter(x => x !== p);
    for (const t of p.tracks) if (t.file && !muUsedElsewhere(t.file)) neo.musicDeleteFile(t.file);  // its files, unless another playlist or the trash still uses them
    muSave(); muLoadPlaylist('Favoris'); muStatus('Playlist supprimée');
  }
  const muTrack = (m, online) => ({display_title: m.author ? `${m.title} - ${m.author}` : m.title, author: m.author || '', publish_date: m.publish_date || '', date_added: Date.now() / 1000,
    song_length: muTime(m.duration), duration: +m.duration || 0, url: m.url, thumbnail_url: m.thumbnail_url || m.thumbnail || '', cover: m.cover || '', file: online ? '' : m.file || '', is_online: !!online});

  /* ---------- Rechercher / importer: one field for a name or any YouTube, SoundCloud or Deezer link ---------- */
  const MU_YT = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\//i, MU_SC = /^https?:\/\/(www\.|m\.)?(soundcloud\.com|on\.soundcloud\.com|snd\.sc)\//i, MU_DZ = /deezer\.com\/|(deezer|dzr)\.page\.link/i;
  async function muSearchDialog() {
    if (mp.pl === 'Favoris') return muNotify('warning', 'NeoMusic', 'Sélectionne une vraie playlist pour ajouter une musique.');
    if (!await muNeedYtdlp()) return;
    const q = await muPrompt('Rechercher / importer', 'Nom de musique, ou lien : vidéo/playlist YouTube, piste/playlist SoundCloud, piste/playlist Deezer :');
    if (!q) return;
    if (MU_YT.test(q)) return /[?&]list=([\w-]+)/.test(q) ? muImportLink(q, 'youtube') : muAddUrl(q);
    if (MU_SC.test(q)) return /soundcloud\.com\/[^/?#]+\/sets\//i.test(q) ? muImportLink(q, 'soundcloud') : muAddUrl(q);
    if (MU_DZ.test(q)) {
      muStatus('Recherche de la piste Deezer...', T.ACCENT_2);
      try {
        const r = await neo.musicDeezer(q);
        if (r.kind === 'playlist') return muImportLink(r.id, 'deezer');
        if (r.kind === 'track') { muStatus('Recherche sur YouTube...', T.ACCENT_2); const [best] = await neo.musicSearch(r.query, 1); if (!best) throw new Error('Introuvable sur YouTube'); return muAddUrl(best.url); }
        return muNotify('warning', 'Rechercher / importer', 'Lien Deezer reconnu mais pas exploitable ici (ni piste, ni playlist) -- ex. lien d\'album ou de profil non pris en charge.');
      } catch (e) { muStatus('Import échoué', T.DANGER); return muNotify('error', 'Piste Deezer', 'Piste introuvable :\n\n' + e.message); }
    }
    muSearchResults(q);
  }
  /* ---------- Chercher un artiste : ses titres les plus écoutés (Deezer), on coche ceux à ajouter à la playlist ouverte ---------- */
  async function muArtistDialog() {
    if (mp.pl === 'Favoris') return muNotify('warning', 'NeoMusic', 'Sélectionne une vraie playlist pour ajouter des musiques.');
    if (!await muNeedYtdlp()) return;
    const q = await muPrompt('Chercher un artiste', "Nom de l'artiste :"); if (!q) return;
    const w = muWindow('Artiste', 720), status = mh('p.muWNote', {text: 'Recherche de ' + q + '…'}), rows = mh('div.muRows'), go = muButton('AJOUTER', () => {}, 'accent'), all = muButton('TOUT COCHER', () => {}, '');
    const head = mh('div.muArtHead', {}, mh('div.ic', {text: q.trim().charAt(0).toUpperCase() || '♪'}), mh('div', {}, mh('b', {text: q}), status)), filter = mh('input.muArtFilter', {placeholder: 'Filtrer les titres…', spellcheck: false}), tools = mh('div.muArtTools', {}, filter, all);
    rows.className = 'muArtList'; w.body.append(head, tools, rows, mh('div.muWEnd', {}, go, muButton('FERMER', w.close, '')));
    let list = [], boxes = [];
    const count = () => { const n = boxes.filter(b => b.checked).length; go.textContent = n ? 'AJOUTER (' + n + ')' : 'AJOUTER'; go.disabled = !n; };
    try {
      const r = await neo.musicArtist(q);
      if (!r) { status.textContent = 'Aucun artiste trouvé.'; return; }
      list = r.tracks; head.querySelector('b').textContent = r.artist; head.querySelector('.ic').textContent = r.artist.charAt(0).toUpperCase(); status.textContent = list.length + ' titres' + (r.fans ? ' · ' + r.fans.toLocaleString('fr-FR') + ' fans' : '') + ' · coche ceux à ajouter dans « ' + mp.pl + ' »';
      if (/^https:\/\//.test(r.picture || '')) { const ph = mh('img.ph', {src: r.picture, alt: r.artist}); ph.onload = () => head.querySelector('.ic')?.replaceWith(ph); }
      const rowEls = [];
      rows.replaceChildren(...list.map((t, i) => { const b = mh('input', {type: 'checkbox'}); boxes.push(b); const row = mh('label.muArtRow', {}, mh('span.n', {text: String(i + 1)}), b, mh('div', {}, mh('b', {text: t.title}), mh('small', {text: t.album || ''})), mh('span.d', {text: t.duration ? muTime(t.duration) : ''})); b.onchange = () => { row.classList.toggle('on', b.checked); count(); }; rowEls.push(row); return row; }));
      filter.oninput = () => { const f = filter.value.toLowerCase(); rowEls.forEach((row, i) => { row.style.display = !f || (list[i].title + ' ' + (list[i].album || '')).toLowerCase().includes(f) ? '' : 'none'; }); };
      all.onclick = () => { const on = boxes.some((b, i) => !b.checked && rowEls[i].style.display !== 'none'); boxes.forEach((b, i) => { if (rowEls[i].style.display !== 'none') { b.checked = on; rowEls[i].classList.toggle('on', on); } }); all.textContent = on ? 'TOUT DÉCOCHER' : 'TOUT COCHER'; count(); };
      go.onclick = async () => {
        const pick = list.filter((_, i) => boxes[i].checked), name = mp.pl; w.close();
        muStatus('Ajout de ' + pick.length + ' titre(s) de ' + r.artist + '…', T.ACCENT_2);
        for (const t of pick) { try { const y = await neo.musicResolve(r.artist, t.title); if (y) await muAddUrl(y.url, name, y); } catch (e) { muWarn('artiste', e); } }
        muStatus('Titres de ' + r.artist + ' ajoutés', T.ACCENT_2);
      };
      count();
    } catch (e) { status.textContent = 'Recherche impossible : ' + e.message; }
  }
  async function muSearchResults(q) {  // five results to choose from (MuPlayer took the first one directly)
    const w = muWindow('Recherche', 620);
    const status = mh('p.muWNote', {text: 'Recherche sur YouTube…'}), rows = mh('div.muRows');
    w.body.append(muH('RÉSULTATS · ' + q), status, rows, mh('div.muWEnd', {}, muButton('FERMER', w.close, 'accent')));
    try {
      const res = await neo.musicSearch(q, 6);
      status.textContent = res.length ? `${res.length} résultat(s) · « ${mp.pl} »` : 'Aucun résultat trouvé.';
      rows.replaceChildren(...res.map(r => mh('div.muWRow', {}, mh('img.muWThumb', {src: r.thumbnail, alt: ''}), mh('div', {}, mh('b', {text: r.title}), mh('span', {text: (r.author || '?') + (r.duration ? ' · ' + muTime(r.duration) : '')})),
        muButton('＋ AJOUTER', e => { e.target.disabled = true; e.target.textContent = 'AJOUTÉE'; muAddUrl(r.url, mp.pl, r); }, 'accent'))));
    } catch (e) { status.textContent = 'Recherche impossible : ' + e.message; muStatus('Recherche échouée'); }
  }
  function muAddUrl(url, name = mp.pl, hint) {  // one song into a playlist: copied from another playlist if it is already somewhere, else downloaded (offline) or only described (online)
    return muQueue(async () => {
      const p = muPl(name); if (!p) return;
      if (p.tracks.some(t => t.url === url)) return muStatus('Déjà présente dans cette playlist');
      const other = mu.playlists.flatMap(x => x.tracks).find(t => t.url === url && (p.mode === 'online' || (t.file && mp.exists[t.file] !== false)));
      if (other) return muAddTracksTo([other], name);
      try {
        let t;
        if (p.mode === 'online') {
          muStatus('Ajout en ligne...', T.ACCENT_2);
          const m = hint?.title ? {...hint, thumbnail_url: hint.thumbnail} : await neo.musicInfo(url);
          m.cover = await neo.musicCover(m.thumbnail_url || m.thumbnail).catch(() => '');
          t = muTrack(m, true);
        } else t = muTrack(await muDownload(url));
        p.tracks.push(t); muSave(); muSizeAchievement(p);
        if (mp.pl === name) muRefresh();
        muStatus(p.mode === 'online' ? 'Musique ajoutée (en ligne)' : 'Musique ajoutée');
        muScheduleReco();
        return t;
      } catch (e) {
        muStatus(p.mode === 'online' ? 'Ajout échoué' : 'Téléchargement échoué', T.DANGER);
        muNotify('error', p.mode === 'online' ? 'Ajout en ligne' : 'Téléchargement', 'Impossible ' + (p.mode === 'online' ? 'd\'ajouter' : 'de télécharger') + ' la musique.\n\n' + e.message);
      }
    });
  }

  /* ---------- whole playlists: YouTube, SoundCloud, Deezer links, or a file (Exportify CSV / JSON / text) ---------- */
  let muImporting = null;
  function muImportWindow(title) {
    const w = muWindow(title, 560), state = {cancel: false};
    const st = mh('b.muImpStatus', {text: 'Analyse de la playlist...'}), det = mh('p.muWNote'), bar = mh('i');
    w.body.append(muH('IMPORT DE PLAYLIST'), st, det, mh('div.muImpBar', {}, bar), mh('div.muWEnd', {}, muButton('ANNULER', () => { state.cancel = true; st.textContent = 'Annulation…'; }, 'danger')));
    state.update = (s, d, f) => { st.textContent = s; det.textContent = d || ''; bar.style.width = Math.round((f || 0) * 100) + '%'; };
    state.w = w;
    return state;
  }
  async function muImportLink(url, kind) {
    if (muImporting) return muNotify('warning', 'NeoMusic', 'Un import de playlist est déjà en cours.');
    const target = mp.pl, ui = muImportWindow('Import de playlist');
    muImporting = ui; muStatus('Analyse de la playlist...', T.ACCENT_2);
    try {
      const entries = await neo.musicEntries(url, kind);
      await muImportEntries(entries, target, ui);
    } catch (e) { ui.w.close(); muNotify('error', 'Import de playlist', 'Impossible de lire cette playlist.\n\n' + e.message); muStatus('Import échoué', T.DANGER); }
    muImporting = null;
  }
  async function muImportEntries(entries, target, ui) {
    const p = muPl(target), online = p.mode === 'online';
    let added = 0, dup = 0, failed = 0;
    for (let i = 0; i < entries.length && !ui.cancel; i++) {
      let e = entries[i];
      ui.update(`${i + 1} / ${entries.length}`, e.title ? e.title + (e.author ? ' — ' + e.author : '') : e.query || e.url, i / entries.length);
      try {
        if (!e.url) { const [best] = await neo.musicSearch(e.query || `${e.title} ${e.author}`, 1); if (!best) throw new Error('introuvable'); e = {...best, ...(e.title ? {} : {})}; }
        if (p.tracks.some(t => t.url === e.url)) { dup++; continue; }
        const other = mu.playlists.flatMap(x => x.tracks).find(t => t.url === e.url && (online || t.file));
        let t;
        if (other) t = {...other, is_online: online || other.is_online};
        else if (online) { const cover = await neo.musicCover(e.thumbnail).catch(() => ''); t = muTrack({...e, cover, thumbnail_url: e.thumbnail}, true); }
        else t = muTrack(await muDownload(e.url));
        p.tracks.push(t); added++;
        if (added % 5 === 0) { muSave(); if (mp.pl === target) muRefresh(); }
      } catch (err) { failed++; muWarn('import', err); }
    }
    muSave(); muSizeAchievement(p); if (mp.pl === target) muRefresh();
    ui.w.close();
    muStatus(ui.cancel ? 'Import annulé' : 'Import terminé', T.ACCENT_2);
    muNotify(failed ? 'warning' : 'success', 'Import de playlist', `${added} musique(s) ajoutée(s) à « ${target} »` + (dup ? `\n${dup} déjà présente(s)` : '') + (failed ? `\n${failed} introuvable(s) ou indisponible(s)` : '') + (ui.cancel ? '\n\nImport annulé avant la fin.' : ''));
  }
  function muCsv(text) {  // rows of a CSV file with quotes, as objects keyed by the header
    const rows = [], row = [''], push = () => rows.push(row.splice(0, row.length, '').slice(0));
    let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { row[row.length - 1] += '"'; i++; } else if (c === '"') q = false; else row[row.length - 1] += c; }
      else if (c === '"') q = true; else if (c === ',') row.push(''); else if (c === '\n') push(); else if (c !== '\r') row[row.length - 1] += c;
    }
    if (row.some(Boolean)) push();
    const [head, ...data] = rows;
    return data.filter(r => r.some(Boolean)).map(r => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] || ''])));
  }
  async function muImportFile(file) {
    if (mp.pl === 'Favoris') return muNotify('warning', 'NeoMusic', 'Sélectionne une vraie playlist avant l\'import.');
    if (!await muNeedYtdlp()) return;
    const text = (await file.text()).replace(/^﻿/, ''), queries = [];
    try {
      if (/\.json$/i.test(file.name)) {
        const d = JSON.parse(text), rows = Array.isArray(d) ? d : d.tracks || [];
        for (const r of rows) { const t = r?.track && typeof r.track === 'object' ? r.track : r || {}; const title = t.track || t.trackName || t.name || t.title; let artist = t.artist || t.artistName || '';
          if (!artist && Array.isArray(t.artists)) artist = t.artists.map(a => a?.name || '').join(', '); if (title) queries.push(`${title} ${artist}`.trim()); }
      } else if (/\.csv$/i.test(file.name)) for (const r of muCsv(text)) { const title = r['Track Name'] || r.track || r.title; if (title) queries.push(`${title} ${r['Artist Name(s)'] || r.artist || r.Artist || ''}`.trim()); }
      else queries.push(...text.split(/\r?\n/).map(l => l.trim()).filter(Boolean));
    } catch (e) { return muNotify('error', 'Import playlist', 'Impossible de lire le fichier :\n\n' + e.message); }
    if (!queries.length) return muNotify('warning', 'Import playlist', 'Aucun titre exploitable dans ce fichier.');
    if (muImporting) return muNotify('warning', 'NeoMusic', 'Un import de playlist est déjà en cours.');
    const ui = muImportWindow('Importer une playlist'); muImporting = ui;
    await muImportEntries(queries.map(q => /^(https?:\/\/|www\.)/.test(q) ? {url: q.replace(/^www\./, 'https://www.')} : {query: q}), mp.pl, ui);
    muImporting = null;
  }

  /* ---------- "Recommandé pour toi", weekly playlists: artists close to the ones you really listen to (Deezer's related artists, weighted by plays) ---------- */
  const muTaste = (cur) => {  // tes artistes, du plus écouté au moins écouté : écoutes + 3 par favori + un bonus pour la musique en cours
    const w = new Map(), add = (a, n) => { a = (a || '').trim(); if (a) w.set(a, (w.get(a) || 0) + n); };
    for (const [a, n] of Object.entries(mu.stats.artists || {})) add(a, Math.min(n, 40));
    for (const t of muPl('Favoris').tracks) add(t.author, 3);
    for (const p of mu.playlists) if (!MU_SYSTEM.includes(p.name)) for (const t of p.tracks) add(t.author, .5);  // toute ta bibliothèque compte un peu, pas seulement les favoris
    if (cur) add(cur.author, 12);
    return [...w].map(([artist, x]) => ({artist, w: x})).sort((p, q) => q.w - p.w);
  };
  const muLibraryArtists = () => [...new Set(mu.playlists.flatMap(p => p.tracks.map(t => (t.author || '').trim().toLowerCase())).filter(Boolean))];
  function muScheduleReco() {
    clearTimeout(mp.recoTimer); const req = ++mp.recoReq;
    if ($('muReco')) $('muReco').textContent = 'Recherche...';
    mp.recoTimer = setTimeout(() => muReco(req), 700);
  }
  async function muReco(req) {
    const show = (title, url, cover) => {
      if (req !== mp.recoReq) return;
      mp.recoUrl = url || ''; $('muReco').textContent = title || 'Aucune recommandation disponible.';
      $('muRecoCover').replaceChildren(...(cover && !mu.settings.noImages ? [mh('img', {src: 'neoplugin://neodex.music/cover/' + encodeURIComponent(cover), alt: ''})] : []));
    };
    muCaps ||= await neo.musicCaps().catch(() => muDefaultCaps);
    const cur = mp.cur || muPl(mp.pl).tracks.at(-1);
    if (!muCaps.ytdlp || !cur) return show('', '', '');
    const seeds = muTaste(cur).slice(0, 6);
    if (!seeds.length) return show('', '', '');
    const have = new Set([...muPl(mp.pl).tracks, ...muPl('Favoris').tracks].map(t => t.url).filter(Boolean));
    try {
      const seen = mu.settings.recoSeen ||= [], found = (await neo.musicMix(seeds, muLibraryArtists())).filter(e => e.url && !have.has(e.url) && !seen.includes(e.url));  // classées par proximité avec tes goûts
      if (req !== mp.recoReq) return;
      let pick = found[Math.floor(Math.random() * Math.min(8, found.length))];  // au hasard parmi les 8 plus proches jamais proposées
      if (!pick) for (const s of seeds.slice(0, 3)) { pick = (await neo.musicSearch(s + ' official song', 8)).find(e => !have.has(e.url) && !seen.includes(e.url) && (!e.duration || (e.duration >= 90 && e.duration <= 600)) && !/reaction|interview|review|compilation|mix|playlist|full album|best of|top 10/i.test(e.title)); if (pick || req !== mp.recoReq) break; }
      if (!pick) return show('', '', '');
      seen.push(pick.url); if (seen.length > 80) seen.shift(); muSave();
      show(pick.title, pick.url, await neo.musicCover(pick.thumbnail).catch(() => ''));
    } catch (e) { muWarn('recommandation', e); show('', '', ''); }
  }
  function muAddReco() {
    if (!mp.recoUrl) return;
    if (mp.pl === 'Favoris') return muNotify('warning', 'NeoMusic', 'Sélectionne une vraie playlist pour ajouter une musique.');
    muAddUrl(mp.recoUrl);
  }
  async function muWeekly() {  // "Radar des sorties" and "Découvertes de la semaine", refilled once a week
    const wk = muWeek();
    if (mu.settings.weeklyWeek === wk && mu.settings.weeklyAlgo === 3) return;  // weeklyAlgo : refait une fois les listes avec les nouveaux calculs
    muCaps ||= await neo.musicCaps().catch(() => muDefaultCaps);
    if (!muCaps.ytdlp) return;
    const taste = muTaste(), artists = taste.map(x => x.artist);
    if (!artists.length) return muStatus('Radar : ajoute des favoris ou écoute quelques musiques');
    mu.settings.weeklyWeek = wk; mu.settings.weeklyAlgo = 3; muSave();
    muQueue(async () => {
      try {
        let news = await neo.musicRadar(artists.slice(0, 30)).catch(() => []);
        if (news.length < 3) news = [...news, ...await neo.musicWeekly(artists.slice(0, 6).map(a => a + ' new release'), true)];  // sans Deezer : la recherche YouTube d'avant
        await muFillWeekly('Radar des sorties', news.slice(0, 24));
        await muFillWeekly('Découvertes de la semaine', (await neo.musicMix(taste.slice(0, 8), muLibraryArtists())).slice(0, 12));
        muStatus('Playlists hebdomadaires mises à jour');
      } catch (e) { muStatus('Mise à jour hebdomadaire indisponible', T.DANGER); muWarn('hebdo', e); }
    });
  }
  async function muFillWeekly(name, entries) {
    const p = muPl(name), old = p.tracks, elsewhere = new Set(mu.playlists.filter(x => x !== p).flatMap(x => x.tracks.map(t => t.url)));
    const items = [];
    for (const e of entries) { if (elsewhere.has(e.url)) continue; try { items.push(muTrack(await muDownload(e.url))); } catch (err) { muWarn(name, err); } }
    p.tracks = items; muSave(); if (mp.pl === name) muRefresh();
    for (const t of old) if (t.file && !muUsedElsewhere(t.file)) neo.musicDeleteFile(t.file);  // last week's songs go, unless kept in another playlist
  }

  /* ---------- sleep mode, music alarm ---------- */
  async function muSleepDialog() {
    const v = await muPrompt('Mode sommeil', 'Nombre de morceaux avant arrêt (vide = durée) :');
    if (v == null) return;
    if (v) {
      if (!/^\d+$/.test(v)) return muNotify('warning', 'Mode sommeil', 'Entre un nombre entier de morceaux.');
      mp.sleepTracks = Math.max(1, +v); mp.sleepAt = null; muSleepIndicator();
      return muStatus(`Sommeil après ${mp.sleepTracks} morceaux`);
    }
    const m = await muPrompt('Mode sommeil', 'Durée en minutes :');
    if (!m) return;
    if (!(+m.replace(',', '.') > 0)) return muNotify('warning', 'Mode sommeil', 'Entre une durée en minutes.');
    mp.sleepTracks = null; mp.sleepAt = Date.now() + Math.max(1, +m.replace(',', '.')) * 60000; muSleepIndicator();
    muStatus('Mode sommeil activé');
  }
  function muSleepIndicator() {
    clearInterval(mp.sleepTimer);
    const el = $('muSleep'), paint = () => { el.textContent = mp.sleepTracks != null ? `☾ ${mp.sleepTracks} pistes` : mp.sleepAt ? '☾ ' + muTime((mp.sleepAt - Date.now()) / 1000) : ''; if (!mp.sleepAt && mp.sleepTracks == null) clearInterval(mp.sleepTimer); };
    paint(); if (mp.sleepAt) mp.sleepTimer = setInterval(paint, 1000);
  }
  function muSleepCountdown() {  // true when the sleep mode just stopped the music
    if (mp.sleepTracks != null) {
      if (--mp.sleepTracks <= 0) { mp.sleepTracks = null; muSleepIndicator(); muStop(); muStatus('Mode sommeil terminé'); return true; }
      muSleepIndicator();
    }
    if (mp.sleepAt && Date.now() >= mp.sleepAt) { mp.sleepAt = null; muSleepIndicator(); muStop(); muStatus('Mode sommeil terminé'); return true; }
    return false;
  }
  async function muWakeDialog() {
    const v = await muPrompt('Réveil musical', 'Heure de lecture (HH:MM) :');
    if (!v) return;
    const m = /^(\d{1,2})[:hH](\d{2})$/.exec(v.trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return muNotify('warning', 'Réveil musical', 'Utilise le format HH:MM, par exemple 07:30.');
    const t = new Date(); t.setHours(+m[1], +m[2], 0, 0); if (t <= Date.now()) t.setDate(t.getDate() + 1);
    clearTimeout(mp.wakeTimer); clearInterval(mp.wakeTick);
    mp.wakeAt = +t;
    mp.wakeTimer = setTimeout(() => { mp.wakeAt = null; $('muWake').textContent = ''; clearInterval(mp.wakeTick); muStatus('Réveil musical'); if (!muAudio || muAudio.paused) muToggle(); }, t - Date.now());
    const paint = () => { $('muWake').textContent = mp.wakeAt ? '◷ ' + muTime((mp.wakeAt - Date.now()) / 1000) : ''; };
    paint(); mp.wakeTick = setInterval(paint, 1000);
    muStatus(`Réveil programmé à ${m[1].padStart(2, '0')}:${m[2]}`);
  }

  /* ---------- levels (from the listening time) and achievements ---------- */
  const muMinutesFor = l => l <= 1 ? 0 : 5.57 * (l - 1) ** 1.55;  // niveau 100 = ~115 h d écoute
  function muLevel() {
    const total = (+mu.stats.seconds || 0) / 60; let level = 1;
    while (muMinutesFor(level + 1) <= total) level++;
    const floor = muMinutesFor(level), next = muMinutesFor(level + 1);
    return {level, total, next, progress: Math.max(0, Math.min(1, (total - floor) / Math.max(1, next - floor)))};
  }
  function muLevelCheck() {
    const {level} = muLevel(); if (level <= (+mu.stats.xp_level_seen || 1)) return;
    mu.stats.xp_level_seen = level;
    const theme = Object.entries(MU_THEME_LEVEL).find(([, l]) => l === level)?.[0];
    muStatus(theme ? `Niveau ${level} atteint — thème « ${theme} » débloqué !` : level === 100 ? 'Niveau 100 atteint — super visualiseur débloqué (Options) !' : level === 150 ? 'Niveau 150 atteint — platine de collection débloquée (Options) !' : `Niveau ${level} atteint !`, T.ACCENT);
    muSave();
  }
  function muUnlock(id) {
    if (mu.achievements.unlocked[id]) return;
    mu.achievements.unlocked[id] = muStamp(); muSave();
    muStatus('Succès débloqué : ' + (MU_ACHIEVEMENTS.find(a => a[0] === id)?.[1] || id), T.ACCENT);
  }
  function muMonthDone(year, month, weekdays, covered, today) {  // every Saturday/Sunday (or Sunday) of the month, checked on the last one
    const days = new Date(year, month, 0).getDate(), match = [];
    for (let d = 1; d <= days; d++) if (weekdays.includes((new Date(year, month - 1, d).getDay() + 6) % 7)) match.push(d);
    return match.length && today === match.at(-1) && match.every(d => covered.includes(d));
  }
  function muRecordPlay(t) {
    const st = mu.stats, title = t.display_title || '', artist = t.author || 'Inconnu', now = new Date(), today = muToday(now);
    st.plays = (+st.plays || 0) + 1; st.songs[title] = (+st.songs[title] || 0) + 1; st.artists[artist] = (+st.artists[artist] || 0) + 1; st.daily[today] = (+st.daily[today] || 0) + 1;
    st.history.push({title, artist, playlist: muPlaylistOf(t)?.name || mp.pl, date: muStamp(now)}); st.history = st.history.slice(-100);
    t.last_played = Date.now() / 1000;
    const pr = mu.achievements.progress;
    if (st.plays >= 1) muUnlock('first_play'); if (st.plays >= 100) muUnlock('hundred_plays'); if (st.plays >= 1000) muUnlock('thousand_plays');
    if (st.seconds >= 24 * 3600) muUnlock('marathon'); if (st.seconds >= 168 * 3600) muUnlock('full_week');
    const songs = new Set(pr.unique_songs); songs.add(muId(t)); pr.unique_songs = [...songs]; if (songs.size >= 500) muUnlock('five_hundred_unique');
    if (t.author) { const a = new Set(pr.unique_artists); a.add(t.author); pr.unique_artists = [...a]; if (a.size >= 50) muUnlock('explorer_50_artists'); }
    const h = now.getHours(), mn = now.getMinutes(), m = now.getMonth() + 1, d = now.getDate(), wd = (now.getDay() + 6) % 7;
    if (h >= 2 && h < 5) muUnlock('insomniac'); if (h < 7) muUnlock('early_bird'); if (h === 0) muUnlock('night_owl');
    if (wd === 4 && d === 13) muUnlock('friday_13'); if (m === 12 && d === 31) muUnlock('new_years_eve'); if (m === 12 && d === 25) muUnlock('christmas'); if (h === mn) muUnlock('palindrome');
    if (pr.last_active_date !== today) {
      const gap = pr.last_active_date ? Math.round((new Date(today) - new Date(pr.last_active_date)) / 864e5) : null;
      if (gap === 1) pr.streak_count = (+pr.streak_count || 0) + 1; else { if (gap >= 30) muUnlock('grand_prince'); pr.streak_count = 1; }
      pr.last_active_date = today;
    }
    const s = +pr.streak_count || 0;
    if (s >= 3) muUnlock('streak_3'); if (s >= 7) muUnlock('streak_7'); if (s >= 30) { muUnlock('streak_30'); muUnlock('grand_prince'); } if (s >= 100) muUnlock('streak_100');
    if (wd >= 5) { if (pr.weekend_month !== m) { pr.weekend_month = m; pr.weekend_days = []; } if (!pr.weekend_days.includes(d)) pr.weekend_days.push(d); if (muMonthDone(now.getFullYear(), m, [5, 6], pr.weekend_days, d)) muUnlock('weekend_warrior'); }
    if (wd === 6) { if (pr.sunday_month !== m) { pr.sunday_month = m; pr.sunday_days = []; } if (!pr.sunday_days.includes(d)) pr.sunday_days.push(d); if (muMonthDone(now.getFullYear(), m, [6], pr.sunday_days, d)) muUnlock('sunday_ritual'); }
    if (t.date_added && Date.now() / 1000 - t.date_added < 86400) muUnlock('fresh_out');
    if ((+st.songs[title] || 0) >= 50) muUnlock('loyal_fan');
    if (pr.obsession_date !== today) { pr.obsession_date = today; pr.obsession_counts = {}; }
    pr.obsession_counts[title] = (+pr.obsession_counts[title] || 0) + 1; if (pr.obsession_counts[title] >= 10) muUnlock('obsession');
    muSave();
  }
  function muFavAchievements() { const n = muPl('Favoris').tracks.length; if (n >= 1) muUnlock('first_favorite'); if (n >= 50) muUnlock('fifty_favorites'); }
  function muSizeAchievement(p) { if (p.tracks.length >= 100) muUnlock('mega_playlist'); }
  function muPlaylistCreated() { const pr = mu.achievements.progress; pr.playlists_created = (+pr.playlists_created || 0) + 1; if (pr.playlists_created >= 1) muUnlock('architect'); if (pr.playlists_created >= 10) muUnlock('dj_in_training'); muSave(); }
  function muShuffleAchievement(id) { const pr = mu.achievements.progress; if (id && pr.last_shuffle_identity === id) muUnlock('lucky'); pr.last_shuffle_identity = id; muSave(); }
  function muShortcutAchievement() { const pr = mu.achievements.progress; pr.shortcut_uses = (+pr.shortcut_uses || 0) + 1; if (pr.shortcut_uses >= 10) muUnlock('shortcut_pro'); muSave(5000); }
  function muStartupAchievements() { const f = mu.achievements.progress.first_seen_date; if (f && (Date.now() - new Date(f)) / 864e5 >= 365) muUnlock('one_year'); }

  /* ---------- Statistiques ---------- */
  function muStatCard(value, label, color) { return mh('div.muStat', {}, mh('b', {text: value, style: {color: color || T.ACCENT}}), mh('span', {text: label})); }
  function muBarChart(values, labels, color, highlightLast) {
    const max = Math.max(1, ...values);
    return mh('div.muChart', {}, ...values.map((v, i) => mh('div', {title: labels[i] + ' : ' + v}, mh('i', {style: {height: Math.max(v ? 3 : 0, v / max * 84) + 'px', background: !highlightLast || i === values.length - 1 ? color : muShade(color, -.45)}}), mh('span', {text: labels[i]}))));
  }
  function muBarRow(rank, primary, secondary, value, max, color) {
    return mh('div.muBarRow', {}, mh('b', {text: rank + '.'}), mh('div', {}, mh('span', {text: primary}), mh('i', {}, mh('i', {style: {width: Math.max(2, Math.min(100, value / (max || 1) * 100)) + '%', background: color}}))), mh('em', {text: secondary}));
  }
  function muStats() {
    const st = mu.stats, plays = +st.plays || 0, secs = +st.seconds || 0, daily = st.daily, w = muWindow('Statistiques', 760), b = w.body;
    const days = Object.keys(daily).filter(d => +daily[d] > 0).sort(), today = new Date(), dayN = d => +daily[muToday(d)] || 0;
    let cur = 0, bestRun = 0, run = 0, prev = null;
    for (const d of days) { const t = new Date(d); run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; bestRun = Math.max(bestRun, run); prev = t; }
    if (prev && Math.round((new Date(muToday(today)) - prev) / 864e5) <= 1) cur = run;
    const mon = new Date(today); mon.setDate(today.getDate() - (today.getDay() + 6) % 7);
    const week = days.filter(d => d >= muToday(mon)).reduce((a, d) => a + +daily[d], 0), month = days.filter(d => d.startsWith(muToday(today).slice(0, 7))).reduce((a, d) => a + +daily[d], 0);
    const bestDay = days.slice().sort((a, x) => daily[x] - daily[a])[0];
    b.append(mh('div.muWHead', {}, muH('STATISTIQUES D\'ÉCOUTE'), days[0] ? mh('span', {text: 'Depuis le ' + days[0].split('-').reverse().join('/')}) : null));
    b.append(muSec('VUE D\'ENSEMBLE'), mh('div.muStats', {}, ...[[String(plays), 'Lectures totales'], [muTime(secs), 'Temps total écouté'], [String(Object.keys(st.songs).length), 'Titres différents écoutés'],
      [String(Object.keys(st.artists).length), 'Artistes différents écoutés'], [muTime(plays ? secs / plays : 0), 'Durée moyenne par lecture'], [String(days.length), 'Jours d\'activité'],
      [cur + ' jour(s)', 'Série d\'écoute actuelle'], [bestRun + ' jour(s)', 'Meilleure série d\'écoute'], [bestDay ? bestDay.slice(8) + '/' + bestDay.slice(5, 7) + ` (${daily[bestDay]})` : '--', 'Jour le plus actif']].map(([v, l]) => muStatCard(v, l))));
    b.append(mh('div.muStats', {}, muStatCard(String(dayN(today)), 'Écoutes aujourd\'hui', T.ACCENT_2), muStatCard(String(week), 'Écoutes cette semaine', T.ACCENT_2), muStatCard(String(month), 'Écoutes ce mois-ci', T.ACCENT_2)));
    const last14 = Array.from({length: 14}, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - 13 + i); return d; });
    b.append(muSec('ACTIVITÉ - 14 DERNIERS JOURS'), muBarChart(last14.map(dayN), last14.map(d => String(d.getDate()).padStart(2, '0')), T.ACCENT, true));
    const wk = [0, 0, 0, 0, 0, 0, 0]; for (const d of days) wk[(new Date(d).getDay() + 6) % 7] += +daily[d];
    b.append(muSec('RÉPARTITION PAR JOUR DE LA SEMAINE'), muBarChart(wk, ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], T.ACCENT_2));
    const top = (o, n = 10) => Object.entries(o).sort((a, x) => x[1] - a[1]).slice(0, n), none = () => mh('p.muWNote', {text: 'Aucune donnée'});
    const ts = top(st.songs); b.append(muSec('TOP 10 TITRES LES PLUS ÉCOUTÉS'), ...(ts.length ? ts.map(([t, n], i) => muBarRow(i + 1, t, n + ' lecture(s)', n, ts[0][1], T.ACCENT)) : [none()]));
    const tt = top(st.songs_time); b.append(muSec('TOP 10 TITRES PAR TEMPS D\'ÉCOUTE'), ...(tt.length ? tt.map(([t, s], i) => muBarRow(i + 1, t, muTime(s), s, tt[0][1], T.ACCENT)) : [none()]));
    const ta = top(st.artists); b.append(muSec('TOP 10 ARTISTES'), ...(ta.length ? ta.map(([a, n], i) => muBarRow(i + 1, a, n + ' lecture(s)' + (st.artists_time[a] ? ' · ' + muTime(st.artists_time[a]) : ''), n, ta[0][1], T.ACCENT_2)) : [none()]));
    const recent = st.history.slice(-8).reverse();
    b.append(muSec('ACTIVITÉ RÉCENTE'), ...(recent.length ? recent.map(e => mh('div.muRecent', {}, mh('span', {text: `${e.title || '?'} — ${e.artist || '?'}`}), mh('em', {text: e.date || ''}))) : [none()]));
    const lv = muLevel();
    b.append(muSec('NIVEAU'), mh('p.muWNote', {text: `Niveau ${lv.level} — ${Math.floor(lv.total)} min d'écoute cumulées`}), mh('div.muLevel', {}, mh('i', {style: {width: Math.max(1, lv.progress * 100) + '%'}})));
    b.append(mh('div.muWEnd', {}, muButton('FERMER', w.close, 'accent')));
  }

  /* ---------- Succès ---------- */
  function muAchievements() {
    const list = MU_ACHIEVEMENTS.filter(a => a[0] !== 'hidden_font' || mu.achievements.unlocked.hidden_font);  // the Discord bonus font has no place in NeoDex
    const w = muWindow('Succès', 760), un = mu.achievements.unlocked;
    w.body.append(mh('div.muWHead', {}, muH('SUCCÈS'), mh('b.muAchCount', {text: `${list.filter(a => un[a[0]]).length} / ${list.length}`})), muNote('Clique sur un succès verrouillé pour voir comment le débloquer.'));
    for (const [id, name, desc] of list) {
      const at = un[id];
      w.body.append(mh('div.muAch' + (at ? '.on' : ''), {}, at ? mh('b', {text: name}) : mh('span.muLock', {html: muLock(34)}),
        mh('div', {}, mh('p', {text: desc}), at ? mh('em', {text: 'Débloqué le ' + at}) : null)));
    }
    w.body.append(mh('div.muWEnd', {}, muButton('FERMER', w.close, 'accent')));
  }

  /* ---------- Corbeille (7 days) ---------- */
  function muTrash() {
    muCleanupTrash();
    const w = muWindow('Corbeille', 700); let pick = -1;
    const list = mh('div.muTrashList', {}, ...mu.trash.map((e, i) => mh('button', {text: `${e.title || e.item?.display_title || '?'}  —  ${e.playlist || 'playlist inconnue'}`, onclick: ev => { pick = i; list.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === ev.target)); }})));
    if (!mu.trash.length) list.append(mh('p.muWNote', {text: 'La corbeille est vide.'}));
    w.body.append(muH('CORBEILLE · RESTAURATION SOUS 7 JOURS'), list, mh('div.muWEnd', {}, muButton('RESTAURER', () => {
      if (pick < 0) return;
      const e = mu.trash.splice(pick, 1)[0], target = muPl(e.playlist) ? e.playlist : mp.pl;
      muPl(target).tracks.push(e.item); muSave(); w.close();
      if (target === mp.pl) muRefresh();
      muStatus(`Musique restaurée dans « ${target} »`);
    }, 'accent')));
  }

  /* ---------- Vérifier la bibliothèque, stockage, journal ---------- */
  async function muLibraryCheck() {
    const w = muWindow('Vérifier la bibliothèque', 640);
    w.body.append(muH('VÉRIFICATION DE LA BIBLIOTHÈQUE'), muNote('Analyse en cours…'));
    const files = [...new Set(mu.playlists.flatMap(p => p.tracks.map(t => t.file)).filter(Boolean))];
    Object.assign(mp.exists, await neo.musicExists(files));
    const missing = mu.playlists.flatMap(p => p.mode === 'offline' ? p.tracks.filter(t => t.file ? mp.exists[t.file] === false : !t.url).map(t => ({t, p})) : []);
    const dups = mu.playlists.flatMap(p => { const c = {}; for (const t of p.tracks) c[muId(t)] = (c[muId(t)] || 0) + 1; return Object.entries(c).filter(([, n]) => n > 1).map(([id, n]) => ({p, id, n, title: p.tracks.find(t => muId(t) === id).display_title})); });
    const used = new Set([...files, ...mu.trash.map(e => e.item?.file).filter(Boolean)]), orphans = (await neo.musicFiles()).filter(f => !used.has(f));
    const section = (title, n, lines) => mh('div.muCheck', {}, mh('b', {text: `${title} (${n})`, style: {color: n ? T.WARN : T.TEXT}}), mh('pre', {text: n ? lines.slice(0, 6).join('\n') + (n > 6 ? `\n… et ${n - 6} de plus` : '') : 'Rien à signaler.'}));
    w.body.replaceChildren(muH('VÉRIFICATION DE LA BIBLIOTHÈQUE'), muNote('Fichiers manquants, doublons et fichiers orphelins détectés.'),
      section('Fichiers manquants', missing.length, missing.map(m => `${m.t.display_title}  —  ${m.p.name}`)), section('Doublons', dups.length, dups.map(d => `${d.title} ×${d.n}  —  ${d.p.name}`)), section('Fichiers orphelins', orphans.length, orphans),
      mh('div.muWBtns', {},
        muButton('RETIRER LES MANQUANTS', async () => { if (!missing.length || !await muConfirm('Fichiers manquants', `Retirer ${missing.length} musique(s) introuvable(s) de leurs playlists ?`)) return; for (const {t, p} of missing) p.tracks.splice(p.tracks.indexOf(t), 1); muSave(); muRefresh(); w.close(); muStatus('Musiques manquantes retirées'); }),
        muButton('RETÉLÉCHARGER LES MANQUANTS', () => { const todo = missing.filter(m => m.t.url); if (!todo.length) return; w.close(); for (const {t} of todo) muQueue(() => muDownloadInto(t).then(() => muSave()).catch(e => muWarn('retéléchargement', e))); muStatus(`${todo.length} musique(s) en cours de téléchargement`, T.ACCENT_2); }),
        muButton('RETIRER LES DOUBLONS', async () => { if (!dups.length || !await muConfirm('Doublons', 'Ne garder qu\'un exemplaire de chaque musique dans chaque playlist ?')) return; for (const p of mu.playlists) { const seen = new Set(); p.tracks = p.tracks.filter(t => !seen.has(muId(t)) && seen.add(muId(t))); } muSave(); muRefresh(); w.close(); muStatus('Doublons retirés'); }),
        muButton('SUPPRIMER LES ORPHELINS', async () => { if (!orphans.length || !await muConfirm('Fichiers orphelins', `Supprimer définitivement ${orphans.length} fichier(s) qui ne sont dans aucune playlist ?`)) return; for (const f of orphans) await neo.musicDeleteFile(f); w.close(); muStatus('Fichiers orphelins supprimés'); }, 'danger')));
  }
  const muSize = n => n >= 1 << 30 ? (n / (1 << 30)).toFixed(2) + ' Go' : n >= 1 << 20 ? (n / (1 << 20)).toFixed(1) + ' Mo' : Math.round(n / 1024) + ' Ko';
  async function muStorage() {
    const w = muWindow('Stockage', 600), s = await neo.musicStorage();
    const row = (label, x) => mh('div.muRecent', {}, mh('span', {text: label}), mh('em', {text: muSize(x.bytes) + (x.count > 1 ? ` · ${x.count} fichiers` : '')}));
    w.body.append(muH('POIDS DE NEOMUSIC'), muNote(s.root), row('Musiques', s.musics), row('Pochettes', s.covers), row('Formes d\'onde et volume (cache de ce PC)', s.cache),
      mh('div.muRecent.total', {}, mh('span', {text: 'Total'}), mh('em', {text: muSize(s.musics.bytes + s.covers.bytes + s.cache.bytes)})),
      mh('div.muWEnd', {}, muButton('VIDER LES CACHES', async () => { if (!await muConfirm('Vider les caches', 'Les formes d\'onde et les volumes seront recalculés à la prochaine écoute. Continuer ?')) return; await neo.musicClearCache(); muCache = {}; w.close(); muStatus('Caches vidés'); muDrawProgress(true); }), muButton('FERMER', w.close, 'accent')));
  }
  function muLogs() {
    const w = muWindow('Journal', 640);
    w.body.append(muH('JOURNAL DE NEOMUSIC'), mh('pre.muLogs', {text: muLog.length ? muLog.slice().reverse().join('\n') : 'Aucune erreur pour l\'instant.'}), mh('div.muWEnd', {}, muButton('FERMER', w.close, 'accent')));
  }

  /* ---------- Options ---------- */
  function muOptions() {
    const st = mu.settings, w = muWindow('Options', 620), b = w.body, lv = muLevel();
    const check = (label, key) => { const c = mh('input', {type: 'checkbox', checked: !!st[key]}); c.dataset.k = key; return mh('label.muCheck', {}, c, mh('span', {text: label})); };
    b.append(muH('OPTIONS'));
    b.append(muSec('AFFICHAGE'), check('Afficher le visualiseur audio', 'visualizer'), lv.level >= 100 ? check('Super visualiseur : reflet, étincelles, lueur et pulsation des basses (niveau 100)', 'superVis') : mh('p.muWNote.ind', {text: 'Super visualiseur : se débloque au niveau 100 (tu es niveau ' + lv.level + ').'}), check('Pochette « lecture en cours » en cercle façon vinyle', 'vinyl'), lv.level >= 150 ? check('Platine de collection : socle en bois et bras doré (niveau 150)', 'deckLuxe') : mh('p.muWNote.ind', {text: 'Platine de collection : se débloque au niveau 150 (tu es niveau ' + lv.level + ').'}),
      check('Forme d\'onde dans la barre de progression (au lieu d\'une simple ligne)', 'waveform'), check('Afficher la date d\'ajout des musiques dans la liste', 'dateAdded'),
      check('Afficher la date de sortie des musiques dans la liste', 'releaseDate'), check('Appli pixel : cadres, boutons et police façon petit lecteur', 'pixelUi'), check('Mode petit lecteur (playlists et musiques uniquement)', 'mini'),
      check('Vue « mur de pochettes » (grille de pochettes) au lieu de la liste', 'gallery'), check('Mode sans images (masque les pochettes partout) — réduit les lags', 'noImages'));
    b.append(muSec('LECTURE'), check('Normaliser le volume entre les morceaux (ReplayGain)', 'replaygain'), check('Fondu de la pochette au changement de morceau', 'coverFade'));

    // equaliser: 10 bands; moving one switches to "Custom" on save, picking a profile only previews it
    const base = (st.equalizer === 'Custom' ? st.eqBands : MU_PRESETS[st.equalizer] || MU_PRESETS.Normal).slice();
    const sliders = MU_BANDS.map((f, i) => { const v = mh('span', {text: (+base[i]).toFixed(1)}), r = mh('input', {type: 'range', min: -12, max: 12, step: .5, value: base[i], oninput: () => v.textContent = (+r.value).toFixed(1)}); return {r, v, col: mh('div.muBand', {}, v, r, mh('b', {text: f >= 1000 ? f / 1000 + 'k' : String(f)}))}; });
    const preset = mh('select.muSelect', {}, ...Object.keys(MU_PRESETS).map(k => mh('option', {text: k, selected: k === st.equalizer})));
    preset.onchange = () => { const g = preset.value === 'Custom' ? st.eqBands : MU_PRESETS[preset.value]; sliders.forEach((s, i) => { s.r.value = g[i]; s.v.textContent = (+g[i]).toFixed(1); }); base.splice(0, 10, ...g); };
    b.append(muSec('ÉGALISEUR'), muNote('Réglez chaque bande manuellement (en dB). Dès qu\'un curseur est déplacé, le profil « Custom » est utilisé à la sauvegarde.'),
      mh('div.muBands', {}, ...sliders.map(s => s.col)),
      mh('div.muWBtns', {}, muButton('RÉINITIALISER', () => sliders.forEach(s => { s.r.value = 0; s.v.textContent = '0.0'; })), mh('span.muWNote', {text: 'ou profil prédéfini :'}), preset));
    const limiter = check('Limiteur/compresseur (évite la saturation à fort volume)', 'limiter'), bal = mh('input.muRange', {type: 'range', min: -1, max: 1, step: .05, value: st.balance});
    b.append(muSec('AUDIO'), limiter, mh('span.muSmall', {text: 'BALANCE GAUCHE / DROITE'}), mh('div.muWBtns', {}, mh('span', {text: 'G'}), bal, mh('span', {text: 'D'}), muButton('RÉINITIALISER', () => bal.value = 0)));
    const nextTheme = Object.values(MU_THEME_LEVEL).filter(l => l > lv.level).sort((a, x) => a - x)[0];
    b.append(muSec('NIVEAU'), muNote(`Niveau ${lv.level} — ${Math.floor(lv.total)} min d'écoute cumulées` + (nextTheme ? ` (prochain thème au niveau ${nextTheme})` : ' (tous les thèmes sont débloqués)')), mh('div.muLevel', {}, mh('i', {style: {width: Math.max(1, lv.progress * 100) + '%'}})));
    b.append(muSec('THÈME'), mh('div.muThemes', {}, ...Object.entries(MU_THEMES).map(([name, c]) => {
      const need = MU_THEME_LEVEL[name], locked = need && lv.level < need;
      if (locked) return mh('button.muTh.locked', {style: {background: c.CARD, color: c.SUBTEXT, borderColor: c.BORDER}, html: `<div class="pv" style="background:${c.BG};place-items:center;display:grid">${muLock(20)}</div><div class="nm" style="background:${c.CARD}"><b>${name}</b><span style="font-weight:400">Niv. ${need}</span></div>`, onclick: () => muStatus(`Thème « ${name} » débloqué au niveau ${need}.`, T.WARN)});
      const bar = (col, w) => mh('u', {style: {background: col, width: w || ''}});
      return mh('button.muTh' + (name === st.theme ? '.on' : ''), {style: {background: c.CARD, color: c.TEXT, borderColor: name === st.theme ? c.ACCENT : c.BORDER, boxShadow: name === st.theme ? '0 0 0 2px ' + c.ACCENT : ''}, title: name, onclick: () => { if (name === st.theme) return; st.theme = name; muApplyTheme(); muSave(); muUnlock('customizer'); w.close(); muOptions(); muDrawProgress(true); }}, mh('div.pv', {style: {background: c.BG}}, mh('i.sd', {style: {background: c.SIDEBAR}}, bar(c.ACCENT), bar(c.SUBTEXT), bar(c.SUBTEXT)), mh('i.mn', {}, mh('u', {style: {background: c.CARD_ALT}}), mh('s', {style: {background: c.TEXT, opacity: .8}}), mh('s', {style: {background: c.SUBTEXT, opacity: .6}}), mh('em', {style: {background: c.ACCENT}}))), mh('div.nm', {style: {background: c.CARD}}, mh('b', {text: (name === st.theme ? '✓ ' : '') + name}), mh('span', {}, bar(c.ACCENT), bar(c.ACCENT_2), bar(c.HEART)))); 
    })));
    // shortcuts: click a field then press the combination (Échap cancels, Retour arrière / Suppr clears)
    const captured = {};
    b.append(muSec('RACCOURCIS CLAVIER'), muNote('Clique dans un champ puis appuie sur la combinaison souhaitée (Échap pour annuler, Retour arrière ou Suppr pour désactiver ce raccourci). Un raccourci doit inclure Ctrl, Alt ou Shift, sauf les touches de fonction (F1-F12) qui peuvent être utilisées seules. Ils marchent partout dans Windows, même NeoDex en arrière-plan.'));
    for (const [key, label, , def] of MU_SHORTCUTS) {
      captured[key] = key in st.shortcuts ? st.shortcuts[key] : def;
      const f = mh('input.muKey', {readonly: true, value: captured[key] || 'Aucun'});
      f.onkeydown = e => {
        e.preventDefault(); e.stopPropagation();
        if (e.key === 'Escape') return f.blur();
        if (e.key === 'Backspace' || e.key === 'Delete') { captured[key] = ''; f.value = 'Aucun'; return f.blur(); }
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
        const k = {' ': 'Space', ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down'}[e.key] || (e.key.length === 1 ? e.key.toUpperCase() : e.key);
        const combo = (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + k;
        if (!/^F\d{1,2}$/.test(k) && !/(Ctrl|Alt|Shift)\+/.test(combo)) return muStatus('Un raccourci doit inclure Ctrl, Alt ou Shift', T.WARN);
        captured[key] = combo; f.value = combo; f.blur();
      };
      f.onfocus = () => f.value = '…'; f.onblur = () => f.value = captured[key] || 'Aucun';
      b.append(mh('div.muKeyRow', {}, mh('span', {text: label}), f));
    }
    b.append(mh('div.muWBtns', {}, muButton('VÉRIFIER LA BIBLIOTHÈQUE', () => muLibraryCheck())));
    b.append(muSec('JOURNAL'), muNote('Consulte le journal des erreurs de NeoMusic (téléchargements, lecture, imports) pour diagnostiquer un problème.'), mh('div.muWBtns', {}, muButton('VOIR LES LOGS', () => muLogs())));
    b.append(muSec('STOCKAGE'), muNote('Calcule le poids réel de NeoMusic sur le disque, détaillé par catégorie (musiques, pochettes, caches...).'), mh('div.muWBtns', {}, muButton('CALCULER LE POIDS DE L\'APPLI', () => muStorage())));
    b.append(muSec('SAUVEGARDE / CAPSULE'), muNote('Ta bibliothèque, tes playlists, tes stats et tes succès sont déjà dans la sauvegarde automatique de NeoDex et la synchro entre PC (les musiques se retéléchargent toutes seules sur un autre PC). La capsule regroupe en plus les fichiers audio et les pochettes dans un seul .zip.'),
      mh('div.muWBtns', {}, muButton('EXPORTER UNE CAPSULE', async () => { muStatus('Création de la capsule...', T.ACCENT_2); try { const f = await neo.musicExportCapsule(mu); muStatus(f ? 'Capsule créée : ' + f.split(/[\\/]/).pop() : 'Prêt', T.ACCENT_2); } catch (e) { muStatus('Échec de la sauvegarde', T.DANGER); muNotify('error', 'Sauvegarde', 'Impossible de créer la capsule.\n\n' + e.message); } }),
        muButton('IMPORTER UNE CAPSULE', async () => {
          if (!await muConfirm('Importer une capsule', 'Ceci va remplacer ta bibliothèque NeoMusic actuelle (playlists, stats, succès et réglages) par celle de la capsule, en gardant tous les fichiers audio. Continuer ?')) return;
          try { const d = await neo.musicImportCapsule(); if (!d) return; mu = muRepair(d); muSave(); w.close(); muApplyTheme(); muApplySettingsUi(); muLoadPlaylist('Favoris'); muHotkeys(); muStatus('Capsule importée', T.ACCENT_2); }
          catch (e) { muStatus('Échec de l\'import', T.DANGER); muNotify('error', 'Import de capsule', 'Impossible d\'importer cette capsule.\n\n' + e.message); }
        })));
    b.append(muSec('MUPLAYER'), muNote('Récupère tout depuis ton dossier MuPlayer : playlists (en ligne et hors ligne), musiques, pochettes, formes d\'onde, statistiques, succès, niveau et réglages. Ce qui existe déjà ici est gardé et complété.'),
      mh('div.muWBtns', {}, muButton('IMPORTER DEPUIS MUPLAYER', () => { w.close(); muImportMuPlayer(); }, 'accent')));
    b.append(mh('div.muWEnd', {}, muButton('SAUVEGARDER', () => {
      for (const c of b.querySelectorAll('input[type=checkbox][data-k]')) st[c.dataset.k] = c.checked;
      const gains = sliders.map(s => +s.r.value), touched = gains.some((g, i) => Math.abs(g - base[i]) > .01);
      if (touched) { st.eqBands = gains; st.equalizer = 'Custom'; } else st.equalizer = preset.value;
      if (preset.value === 'Custom' && !touched) st.eqBands = gains;
      st.balance = Math.round(+bal.value * 100) / 100;
      const vals = Object.values(captured).filter(Boolean);
      if (new Set(vals).size !== vals.length) return muNotify('warning', 'Options', 'Chaque raccourci doit être différent.');
      st.shortcuts = {...captured};
      muSave(); muHotkeys(); muApplySettingsUi(); muRefresh(); muSetCover(mp.cur); muDrawProgress(true);
      w.close(); muStatus('Options sauvegardées');
    }, 'accent')));
  }

  /* ---------- MuPlayer folder import: playlists + files + covers + waveforms + stats + achievements + settings, merged ---------- */
  async function muImportMuPlayer() {
    muCaps ||= await neo.musicCaps().catch(() => muDefaultCaps);
    if (!await muConfirm('Importer depuis MuPlayer', 'Choisis le dossier de MuPlayer (celui qui contient « jsons », « musics » et « covers »). Les playlists, stats, succès et réglages seront fusionnés avec NeoMusic. Continuer ?')) return;
    muStatus('Import de MuPlayer...', T.ACCENT_2);
    let d;
    try { d = await neo.musicImportMuPlayer(muCaps.muplayer); } catch (e) { muStatus('Import échoué', T.DANGER); return muNotify('error', 'MuPlayer', e.message); }
    if (!d) return muStatus('Prêt');
    let added = 0;
    for (const src of d.playlists) {
      let p = muPl(src.name);
      if (!p) { p = {name: src.name, mode: src.mode, tracks: []}; mu.playlists.push(p); }
      const have = new Set(p.tracks.map(muId));
      for (const t of src.tracks) if (!have.has(muId(t))) { p.tracks.push(t); have.add(muId(t)); added++; }
    }
    Object.assign(muCache, Object.fromEntries(Object.entries(d.waveforms || {}).map(([id, w]) => [id.startsWith('file:') || id.startsWith('url:') ? id : 'url:' + id, {...muCache[id], w}])));
    muCacheDirty = true;
    const again = !!mu.settings.muplayerImported;  // a second import completes the playlists but must not count the plays twice
    mu.settings.muplayerImported = true;
    const s = again ? {} : d.stats || {}, st = mu.stats, add = (a, b2) => { for (const [k, v] of Object.entries(b2 || {})) a[k] = (+a[k] || 0) + (+v || 0); };
    st.plays = (+st.plays || 0) + (+s.plays || 0); st.seconds = (+st.seconds || 0) + (+s.seconds || 0);
    for (const k of ['songs', 'songs_time', 'artists', 'artists_time', 'daily']) add(st[k], s[k]);
    st.history = [...(s.history || []), ...st.history].sort((a, b2) => String(a.date).localeCompare(String(b2.date))).slice(-100);
    const a = (again ? {unlocked: d.achievements?.unlocked} : d.achievements) || {}, ach = mu.achievements;
    for (const [id, at] of Object.entries(a.unlocked || {})) if (!ach.unlocked[id] || at < ach.unlocked[id]) ach.unlocked[id] = at;
    const pr = ach.progress, ap = a.progress || {};
    pr.unique_songs = [...new Set([...pr.unique_songs, ...(ap.unique_songs || []).map(x => Array.isArray(x) ? (x[0] === 'url' ? 'url:' + x[1] : 'file:' + String(x[1]).split(/[\\/]/).pop()) : x)])];
    pr.unique_artists = [...new Set([...pr.unique_artists, ...(ap.unique_artists || [])])];
    pr.playlists_created = (+pr.playlists_created || 0) + (+ap.playlists_created || 0); pr.shortcut_uses = (+pr.shortcut_uses || 0) + (+ap.shortcut_uses || 0);
    if (ap.first_seen_date && ap.first_seen_date < pr.first_seen_date) pr.first_seen_date = ap.first_seen_date;
    if (ap.last_active_date && (!pr.last_active_date || ap.last_active_date > pr.last_active_date)) { pr.last_active_date = ap.last_active_date; pr.streak_count = ap.streak_count; }
    const ms = d.settings || {}, set = mu.settings, map = {theme_name: 'theme', volume: 'volume', equalizer: 'equalizer', limiter_enabled: 'limiter', audio_balance: 'balance', show_visualizer: 'visualizer', show_waveform: 'waveform',
      vinyl_cover_frame: 'vinyl', replaygain_enabled: 'replaygain', cover_fade_enabled: 'coverFade', show_date_added: 'dateAdded', show_release_date: 'releaseDate', gallery_view: 'gallery', no_images_mode: 'noImages'};
    for (const [from, to] of Object.entries(map)) if (from in ms) set[to] = ms[from];
    if (!(set.theme in MU_THEMES)) set.theme = 'Nova'; if (!(set.equalizer in MU_PRESETS)) set.equalizer = 'Normal';
    if (ms.eq_band_gains && typeof ms.eq_band_gains === 'object') set.eqBands = MU_BANDS.map(f => +ms.eq_band_gains[f] || 0);
    const sk = {shortcut_play: 'play', shortcut_previous: 'previous', shortcut_next: 'next', shortcut_volume_up: 'volumeUp', shortcut_volume_down: 'volumeDown', shortcut_mute: 'mute', shortcut_seek_forward: 'seekForward',
      shortcut_seek_backward: 'seekBackward', shortcut_shuffle: 'shuffle', shortcut_favorite: 'favorite', shortcut_fullscreen: 'fullscreen', shortcut_mini_player: 'mini'};
    for (const [from, to] of Object.entries(sk)) if (from in ms && ms[from] !== 'Ctrl+Alt+N') set.shortcuts[to] = ms[from];  // Ctrl+Alt+N stays NeoDex's
    if (!again) mu.trash.push(...(d.trash || []).map(e => ({item: {...e.item, display_title: e.item.display_title || e.title}, playlist: e.playlist, title: e.title, deleted_at: e.deleted_at})));
    muSave(); muApplyTheme(); muApplySettingsUi(); muLoadPlaylist(mp.pl); muHotkeys();
    muStatus('MuPlayer importé', T.ACCENT_2);
    muNotify('success', 'MuPlayer', `${added} musique(s) dans ${d.playlists.length} playlist(s)\n${d.copied.files} fichier(s) audio et ${d.copied.covers} pochette(s) copiés\n${+s.plays || 0} lecture(s) et ${Object.keys(a.unlocked || {}).length} succès récupérés`);
  }
  // ---- ce que NeoDex doit savoir de ce plugin ----
  host.hooks({ onTabChange: () => muMiniSync(), onClose: () => { if (muAudio && !muAudio.paused) muPause(); }, audio: () => muAudio ? { audible: !muAudio.paused && !muAudio.muted, muted: muAudio.muted } : null, mute: on => { if (muAudio) muAudio.muted = on; }, playing: () => !!muAudio && !muAudio.paused && !muAudio.muted });  // son de l'onglet, mini-lecteur, fermeture de l'onglet, NeoMe qui danse
  // ---- fin ----
  ctx.onOpen(() => { muOpen(); });
  ctx.onClose(() => { try { muAudio?.pause(); } catch {} document.querySelectorAll('.muMini').forEach(e => e.remove()); document.getElementById('muStyle')?.remove(); });
}
