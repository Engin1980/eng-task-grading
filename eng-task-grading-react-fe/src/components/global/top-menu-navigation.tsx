import { Link } from "@tanstack/react-router";
import { useContext } from "react";
import { NavigationContext } from "../../contexts/NavigationContext";
import { TaskIcon } from "../../ui/icons/taskIcon";
import { AttendanceIcon } from "../../ui/icons/attendanceIcon";
import { CourseIcon } from "../../ui/icons/courseIcon";

export function TopMenuNavigation() {
  const navCtx = useContext(NavigationContext);
  const separator = "▸";

  return (<>
    <Link to="/courses" className="mr-1 text-blue-600">Kurzy</Link>
    {navCtx?.course && <>
      <span className="text-gray-600">{separator}</span>
      <span className="translate-y-0.5">
        <CourseIcon />
      </span>
      <Link to={`/courses/${navCtx.course.id}/grades`} className="mx-1 text-blue-600">{navCtx.course.title}</Link>
    </>}
    {navCtx?.task && <>
      <span className="text-gray-600 mr-1">{separator}</span>
      <span className="translate-y-0.5">
        <TaskIcon />
      </span>
      <Link to={`/tasks/${navCtx.task.id}`} className="mr-1 text-blue-600">{navCtx.task.title}</Link>
    </>}
    {navCtx?.attendance && <>
      <span className="text-gray-600 mr-1">{separator}</span>
      <span className="translate-y-0.5">
        <AttendanceIcon />
      </span>
      <Link to={`/attendances/${navCtx.attendance.id}/days`} className="mr-1 text-blue-600">{navCtx.attendance.title}</Link>
    </>}
  </>);
}