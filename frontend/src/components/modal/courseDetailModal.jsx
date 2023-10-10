import React from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import CourseCalendar from "../calendar/courseCalendar";

export default function CourseDetailModal({ isOpen, onClose, course }) {
    return(
        <Modal size="large" hiddingButton open={isOpen} icon={<HailIcon/>} setDisplay={() => onClose()} title={course?.title}>
            <CourseCalendar course={course}/>
        </Modal>
    );
}