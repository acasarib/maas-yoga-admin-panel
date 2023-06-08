import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ButtonPrimary from './button/primary';
import ButtonSecondary from './button/secondary';

export default function Modal(props) {
  
  const cancelButtonRef = useRef(null);

  const onClose = () => {
    if (typeof props.onClose === "function")
      props.onClose();
    props.setDisplay(false)
  }

  return (
    <>
    {(props.open) && (<>
      <div as="div" className="relative z-10" initialfocus={cancelButtonRef} onClose={onClose}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 overflow-y-auto overflow-x-auto scale-up-center">
          <div className="flex min-h-full items-end justify-center p-4 text-center items-center sm:p-0">
              <div className={`relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${props.className}`} style={props.style}>
                <div className="rounded-t-md bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex flex-col">
                    <div className="modal-header w-full flex justify-between">
                      <div className="flex items-center">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                          {props.icon}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <div as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            {props.title}
                          </div>
                        </div>
                      </div>
                      <CloseIcon className="cursor-pointer" onClick={onClose}/>
                    </div>
                    <div className="mt-2">
                      {props.children}
                    </div>
                  </div>
                </div>
                <div className="w-full flex bg-orange-50 px-4 py-3 sm:flex-row-reverse sm:px-6">
                  {!props.hiddingButton && (<ButtonPrimary
                    className="w-full sm:w-auto sm:ml-2 mr-1 sm:mr-0"
                    disabled={props.buttonDisabled}
                    onClick={props.onClick}
                    >
                    {props.buttonText}
                  </ButtonPrimary>)}
                  <ButtonSecondary
                    className="w-full sm:w-auto ml-1 sm:ml-0"
                    type="button"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    {props.closeText ? props.closeText : 'Cancelar'}
                  </ButtonSecondary>
                </div>
              </div>
          </div>
        </div>
      </div></>
    )}
    </>
  )
}