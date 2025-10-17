import { Button } from '../component/ui/Button' ;
import { Card } from '../component/ui/Card.tsx';
import { IconMap } from '../component/icon/IconComponents.tsx'
import { createContext, memo, useContext, useRef, useState } from 'react';
import { PopUpBox } from '../component/ui/PopUpScreen.tsx';
import { SideBar , SideBarItem } from '../component/ui/Sidebar.tsx';
import { ShareBrain } from '../component/ui/ShareBrainScreen.tsx';
import { SearchBar } from '../component/ui/SearchBar.tsx';
import { useContent } from '../hooks/useGetContent.tsx';
import { useNavigate, useParams }  from 'react-router-dom'
import { useShareContent } from '../hooks/useShareContent.tsx';


export const currentFileContext = createContext<any>(null) ;

export const DashBoard = ({ share } : { share : boolean } ) => {

    const [popUp,setPopUp] = useState(false) ; 
    const ClosePopUpBox = () => setPopUp(false) ; 
    const OpenPopUpBox  = () => setPopUp(true) ;

    const [isBrainShared,setBrain]  = useState(false) ; 
    const shareBrain    = () => setBrain(true) ; 
    const NotshareBrain = () => setBrain(false) ; 

    const {shareLink} = useParams() ;
    const {contents,setContents,RefreshContent} = (share) ? useShareContent(shareLink!) : useContent()  ; 

    const [SideBarVisible,setSideBar] = useState(false) ;
    const ToggleSideBar = () => setSideBar(!SideBarVisible) ;

    const ChangePage = (page : string) => setContentPage(page) ;    
  
    const [MenuBarVisible,setMenuBar] = useState(true) ;
    const CloseMenuBar = () => setMenuBar(false) ;
    const OpenMenuBar  = () => setMenuBar(true) ;

    const [ContentPage,setContentPage]  = useState("Home") ;
    const [FileId,setFileId]            = useState<any>(null) ; 

    const RefreshFileContentRef = useRef<() => Promise<any>>(async () => {});

    return(
    <currentFileContext.Provider value = {{setContents : setContents,contents : contents ,FileId : FileId ,setFileId : setFileId, 
    ChangePage : ChangePage, RefreshContent : RefreshContent , RefreshFileContentRef : RefreshFileContentRef , share : share}} >

        <div className="bg-gray-100 h-screen w-screen overflow-auto scrollbar-hide">
            <SideBar varaint="primary" share={share} size="sm" title="Digi Brain" ChangePage={ChangePage} SideBarVisible={SideBarVisible} shareBrain={shareBrain} OpenPopUpBox={OpenPopUpBox} />
            {!SideBarVisible && <MenuBar ChangePage={ChangePage} MenuBarVisible ={MenuBarVisible} CloseMenuBar={CloseMenuBar} OpenMenuBar={OpenMenuBar}/>}
          
            {/* Top Bar with search  */}
            <TopBar popUp={popUp} isBrainShared={isBrainShared} shareBrain={shareBrain} OpenPopUpBox={OpenPopUpBox} onClick={ToggleSideBar} />
            <PopUpBox isPopUpOpen = {popUp} ClosePopUpBox = {ClosePopUpBox} RefreshContent = {RefreshContent} />
            <ShareBrain isBrainShared = {isBrainShared}  NotshareBrain = {NotshareBrain} />

            <div className="px-2 mt-35 pl-6 sm:pl-60 md:pl-77 lg:pl-80">
                <div className="columns-1 lg:gap-0 lg:columns-2 xl:columns-3 ">
                {contents.map(( {_id,type,title,description,tags,link} : any) =>  <Card key={_id} share = {share} contentId = {_id} RefreshContent = {RefreshContent} varaint="primary" title={title} size="sm" description = {description}  tags={tags} ContentType={type} ContentPage={ContentPage} url={link} /> )}
                </div>
            </div>
        </div>
    </currentFileContext.Provider>
    )
}


const TopBar = memo((props:any) =>{
    const MenuIcon    = useRef(IconMap["Menu"]) ; 
    const FileContext = useContext(currentFileContext) ;
    return(
        <div className={` ${(props.popUp || props.isBrainShared) ? 'opacity-20' : ' bg-white border-2 border-gray-200 border-l-white' } p-3 fixed left-0 right-0 sm:ml-55 md:ml-72 flex justify-between items-center`}>
            <div className='flex items-center'>
                <div className='block sm:hidden cursor-pointer pr-2' onClick={props.onClick}> 
                    <MenuIcon.current size="sm" customSize='h-[40px]' /> 
                </div>
                <div> 
                    <SearchBar/>
                </div>
            </div>
            {
                !FileContext.share && 
                <div className='hidden sm:flex gap-4 justify-end '> 
                    <div> <Button varaint="primary" size ="sm" text="Share Brain" hideText={true} startIcon={IconMap["Share"]} onClick={props.shareBrain} /> </div> 
                    <div> <Button varaint="secondary" size ="sm" text="Add Content"hideText={true} startIcon={IconMap['Plus']} onClick={props.OpenPopUpBox} /> </div>
                </div>
            }
        </div>
    );
})

const MenuBar = (props : any) =>{
    const navigate = useNavigate() ; 
    const LogOut = () =>{
        localStorage.removeItem('token') ; 
        navigate('/auth') ;
    }

    const FileContext = useContext(currentFileContext) ;
    return(
        <div className={`fixed ${props.MenuBarVisible ? "h-full opacity-70" : "opacity-100" } top-22 right-0  bg-white transition-all duration-1000`}>
            {!props.MenuBarVisible && <SideBarItem varaint="primary" size="sm" Icon="Down" onClick={props.OpenMenuBar}/>}
            {
            props.MenuBarVisible &&
            <div>
                <SideBarItem varaint="primary" size="md" Icon="Up" onClick={props.CloseMenuBar}/>
                <SideBarItem varaint="primary" size="md" Icon="Home" 
                    onClick={ () => {
                        FileContext.setFileId(null) ;
                        props.ChangePage("Home") ; 
                        FileContext.RefreshContent() ; 
                    }}/>

                <SideBarItem varaint="primary" size="md" Icon="Tweet"    onClick={props.ChangePage}/>
                <SideBarItem varaint="primary" size="md" Icon="Youtube"  onClick={props.ChangePage}/>
                <SideBarItem varaint="primary" size="md" Icon="Document" onClick={props.ChangePage}/>            
                <SideBarItem varaint="primary" size="md" Icon="LogOut"   onClick={LogOut}/>   
            </div> 
            }   
        </div>
    )
}