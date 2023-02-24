import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';

export default function Modal(props) {
  
  const cancelButtonRef = useRef(null);

  const onClose = () => {
    props.setDisplay(false)
  }

  return (
    <>
    {(props.open) && (<>
      <div as="div" className="relative z-10" initialfocus={cancelButtonRef} onClose={onClose}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 overflow-y-auto overflow-x-auto scale-up-center">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" style={props.style}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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
                <div className="flex justify-items-end bg-orange-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {!props.hiddingButton && (<button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-orange-300 px-4 py-2 text-base font-medium text-yellow-900 shadow-sm hover:bg-orange-550 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={props.onClick}
                  >
                    {props.buttonText}
                  </button>)}
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100 text-base font-medium text-yellow-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    {props.closeText ? props.closeText : 'Cancelar'}
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div></>
    )}
    </>
  )
}