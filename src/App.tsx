/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Module1 from './pages/Module1';
import Module2 from './pages/Module2';
import Module from './pages/Module';
import Reflection from './pages/Reflection';
import Journal from './pages/Journal';
import { JournalProvider } from './context/JournalContext';

export default function App() {
  return (
    <BrowserRouter>
      <JournalProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="module/intro" element={<Module1 />} />
            <Route path="module/reframe" element={<Module2 />} />
            <Route path="module/:id" element={<Module />} />
            <Route path="reflection/:id" element={<Reflection />} />
            <Route path="journal" element={<Journal />} />
          </Route>
        </Routes>
      </JournalProvider>
    </BrowserRouter>
  );
}
