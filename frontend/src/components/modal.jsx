import React, { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ButtonPrimary from './button/primary';
import ButtonSecondary from './button/secondary';
import { COLORS } from '../constants';

export default function Modal(props) {  
  const cancelButtonRef = useRef(null);
  const [isVisible, setIsVisible] = useState(props.open);
  const [isClosing, setIsClosing] = useState(false);
  const animationDuration = 300;

  useEffect(() => {
    let timeoutId;
    if (props.open) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, animationDuration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [props.open, isVisible]);

  const onClose = () => {
    if (typeof props.onClose === "function")
      props.onClose();
    props.setDisplay(false)
  }

  const handleOnClickPrimaryButton = () => {
    props.onClick()
  }

  const getModalSize = (size) => {
    if (size === "small") {
      return "md:max-w-sm"
    } else if (size === "medium"){
      return "md:max-w-screen-md"
    }else if(size === "large") {
      return "md:max-w-screen-lg"
    }
    return "";
  }

  return (
    <>
    {(isVisible) && (<>
      <div as="div" className="relative z-100" initialfocus={cancelButtonRef} onClose={onClose}>
      <div className={`fixed inset-0 bg-gray-500 transition-opacity modal-backdrop ${isClosing ? 'modal-backdrop--closing' : 'modal-backdrop--opening'}`} />

        <div className="fixed inset-0 overflow-y-auto overflow-x-auto" onClick={onClose}>
          <div className="flex min-h-full items-end justify-center p-3 text-center items-center sm:p-0">
              <div className={`relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg modal-content ${isClosing ? 'modal-content--closing' : 'modal-content--opening'} ${getModalSize(props.size)} ${props.className}`} style={props.style} onClick={event => event.stopPropagation()}>
                <div className="rounded-t-md bg-white px-4 pt-6">
                  <div className="flex flex-col">
                    <div className="modal-header w-full flex justify-between">
                      <div className="flex items-center">
                        <div style={{backgroundColor: props.danger ? COLORS.red[100] : COLORS.primary[100]}} className="mr-2 mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                          {props.danger ? React.cloneElement(props.icon, { style: { color: COLORS.red[600] } }) : props.icon}
                        </div>
                        <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <div as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            {props.title}
                          </div>
                        </div>
                      </div>
                      <CloseIcon className="cursor-pointer" onClick={onClose}/>
                    </div>
                    <div className="my-6">
                      {props.children}
                    </div>
                  </div>
                </div>
                {(props.footer === undefined || props.footer === true) &&
                  <div style={{backgroundColor: COLORS.primary[50]}} className={`w-full rounded-b-md flex px-4 py-3 flex-row-reverse sm:px-6 ${props.hiddenFooter ? "hidden" : ""}`}>
                    {!props.hiddingButton && (<ButtonPrimary
                      className="w-full sm:w-auto sm:ml-2 ml-1 sm:mr-0"
                      disabled={props.buttonDisabled}
                      onClick={handleOnClickPrimaryButton}
                      danger={props.danger}
                      >
                      {props.buttonText}
                    </ButtonPrimary>)}
                    <ButtonSecondary
                      className="w-full sm:w-auto mr-1 sm:ml-0"
                      type="button"
                      onClick={onClose}
                      innerRef={cancelButtonRef}
                    >
                      {props.closeText ? props.closeText : 'Cancelar'}
                    </ButtonSecondary>
                  </div>
                }
              </div>
          </div>
        </div>
      </div></>
    )}
    </>
  )
}