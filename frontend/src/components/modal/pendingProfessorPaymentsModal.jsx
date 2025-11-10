import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../modal';
import HailIcon from '@mui/icons-material/Hail';
import { Context } from '../../context/Context';
import Loader from '../spinner/loader';
import NoDataComponent from '../table/noDataComponent';
import { formatDateDDMMYY, formatPaymentValue, getMonthNameByMonthNumber } from '../../utils';
import DangerAlert from '../alert/danger';
import WarningAlert from '../alert/warning';

const PendingProfessorPaymentsModal = ({ isOpen, onClose }) => {
  const { getPendingProfessorPayments } = useContext(Context);
  const [professors, setProfessors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getPendingProfessorPayments();
        if (isMounted) {
          setProfessors(response ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError('Ocurrió un error al obtener los pagos pendientes. Intentalo nuevamente.');
          setProfessors([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchPendingPayments();
    } else {
      setProfessors([]);
      setError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, getPendingProfessorPayments]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-8 flex justify-center items-center">
          <Loader size={16} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-6 text-center text-sm text-red-600">
          {error}
        </div>
      );
    }

    if (!professors.length) {
      return (
        <NoDataComponent
          Icon={HailIcon}
          title="Sin pagos pendientes"
          subtitle="No se encontraron profesores con pagos adeudados o por verificar"
        />
      );
    }

    return (
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {professors.map((professor) => (
          <ProfessorCard key={professor.id} professor={professor} />
        ))}
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      footer={false}
      onClose={onClose}
      title="Pagos pendientes de profesores"
      onClick={onClose}
      setDisplay={onClose}
      icon={<HailIcon />}
      size="large"
    >
      {renderContent()}
    </Modal>
  );
};

const ProfessorCard = ({ professor }) => {
  const owedByCourse = groupPeriodsByCourse(professor.owedPeriods);
  const pendingVerificationByCourse = groupPeriodsByCourse(professor.notVerifiedPeriods);
  const owedCount = professor.owedPeriods?.length ?? 0;
  const notVerifiedCount = professor.notVerifiedPeriods?.length ?? 0;

  return (
    <div className="border rounded-md bg-white shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-800">{`${professor.name} ${professor.lastName}`}</p>
            <Link 
              to={`/home/professors/${professor.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              (Ver detalle)
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {owedCount > 0 && `${owedCount} mes${owedCount === 1 ? '' : 'es'} adeudado${owedCount === 1 ? '' : 's'}`}
            {owedCount > 0 && notVerifiedCount > 0 && ' • '}
            {notVerifiedCount > 0 && `${notVerifiedCount} pago${notVerifiedCount === 1 ? '' : 's'} sin verificar`}
            {owedCount === 0 && notVerifiedCount === 0 && 'Sin información disponible'}
          </p>
        </div>
      </div>

      {owedCount > 0 && (
        <Section title="Meses adeudados">
          {Object.values(owedByCourse).map(({ course, periods }) => (
            <CourseCardDanger key={course?.id ?? `owed-${course?.title}`} course={course}>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {periods.map((period, index) => (
                  <li key={`owed-${course?.id ?? 'course'}-${period.year}-${period.month}-${index}`}>
                    {`${getMonthNameByMonthNumber(period.month)} ${period.year}`}
                  </li>
                ))}
              </ul>
            </CourseCardDanger>
          ))}
        </Section>
      )}

      {notVerifiedCount > 0 && (
        <Section title="Pagos pendientes de verificación">
          {Object.values(pendingVerificationByCourse).map(({ course, periods }) => (
            <CourseCardWarning key={course?.id ?? `not-verified-${course?.title}`} course={course}>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {periods.map((period, index) => (
                  <li key={`not-verified-${course?.id ?? 'course'}-${period.payment?.id ?? index}`}>
                    <span className="font-medium text-gray-800">{`${getMonthNameByMonthNumber(period.month)} ${period.year}`}</span>
                    {period.payment && (
                      <span className="text-gray-600">{` • ${formatPaymentValue(period.payment.value, false)} • Registrado ${formatPaymentDate(period.payment.operativeResult)}`}</span>
                    )}
                  </li>
                ))}
              </ul>
            </CourseCardWarning>
          ))}
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mt-4">
    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
    <div className="mt-2 flex flex-col gap-2">
      {children}
    </div>
  </div>
);

const CourseCardDanger = ({ course, children }) => (
  <DangerAlert title={course.title} className="rounded border border-gray-200 bg-gray-50 p-3">
    <div className="mt-2">
      {children}
    </div>
  </DangerAlert>
);

const CourseCardWarning = ({ course, children }) => (
  <WarningAlert title={course.title} className="rounded border border-gray-200 bg-gray-50 p-3">
    <div className="mt-2">
      {children}
    </div>
  </WarningAlert>
);

const groupPeriodsByCourse = (periods = []) => {
  return periods.reduce((accumulator, period) => {
    const courseId = period.course?.id ?? period.courseId ?? 'unknown';
    if (!accumulator[courseId]) {
      accumulator[courseId] = {
        course: period.course,
        periods: [],
      };
    }
    accumulator[courseId].periods.push(period);
    return accumulator;
  }, {});
};

const formatPaymentDate = (date) => {
  if (!date) return 'sin fecha';
  return formatDateDDMMYY(date);
};

export default PendingProfessorPaymentsModal;
