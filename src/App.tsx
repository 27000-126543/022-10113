import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import CustomerList from '@/pages/Customer/List';
import CustomerDetail from '@/pages/Customer/Detail';
import NewCustomer from '@/pages/Customer/New';
import QuestionnaireForm from '@/pages/Questionnaire/Form';
import TriageBoard from '@/pages/Triage/Board';
import DoctorSchedule from '@/pages/Doctor/Schedule';
import Review from '@/pages/Review';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<NewCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/questionnaire" element={<Navigate to="/customers" replace />} />
          <Route path="/questionnaire/:id" element={<QuestionnaireForm />} />
          <Route path="/triage" element={<TriageBoard />} />
          <Route path="/doctors" element={<DoctorSchedule />} />
          <Route path="/review" element={<Review />} />
        </Route>
      </Routes>
    </Router>
  );
}
