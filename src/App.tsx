/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Module1 from './pages/Module1';
import Module2 from './pages/Module2';
import Module3 from './pages/Module3';
import Module4 from './pages/Module4';
import Module5 from './pages/Module5';
import Module from './pages/Module';
import Reflection from './pages/Reflection';
import Journal from './pages/Journal';
import JournalM4 from './pages/JournalM4';
import { JournalProvider } from './context/JournalContext';
import { OnboardingProvider } from './context/OnboardingContext';

export default function App() {
  return (
    <BrowserRouter>
      <JournalProvider>
        <OnboardingProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="module/intro" element={<Module1 />} />
            <Route path="module/reframe" element={<Module2 />} />
            <Route path="module/meaning" element={<Module3 />} />
            <Route path="module/wonder" element={<Module4 />} />
            <Route path="module/compass" element={<Module5 />} />
            <Route path="module/:id" element={<Module />} />
            <Route path="reflection/:id" element={<Reflection />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/m4" element={<JournalM4 />} />
          </Route>
        </Routes>
        </OnboardingProvider>
      </JournalProvider>
    </BrowserRouter>
  );
}
