import { useState } from 'react';
import { useLogger } from '../../hooks/use-logger';
import type { StudentCreateDto } from '../../model/student-dto';
import { ImportStudentsModal } from './ImportStudentsModal';

interface StudentsTabProps {
    courseId: string;
}

export function StudentsTab({ courseId }: StudentsTabProps) {
    const logger = useLogger("StudentsTab");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Mock data pro studenty using StudentCreateDto
    const students: StudentCreateDto[] = [
        {
            number: 'A21N0101P',
            name: 'Jan',
            surname: 'Novák',
            userName: 'novakj01',
            email: 'jan.novak@email.com',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
        },
        {
            number: 'A21N0102P',
            name: 'Marie',
            surname: 'Svobodová',
            userName: 'svobm01',
            email: 'marie.svobodova@email.com',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
        },
        {
            number: 'A21N0103P',
            name: 'Petr',
            surname: 'Dvořák',
            userName: 'dvorp01',
            email: 'petr.dvorak@email.com',
            studyProgram: 'Informatika',
            studyForm: 'Kombinovaná'
        },
        {
            number: 'A21N0104P',
            name: 'Anna',
            surname: 'Nováková',
            userName: 'novaa01',
            email: 'anna.novakova@email.com',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
        }
    ];

    const handleImport = async (importText: string) => {
        logger.info('Processing import text', { courseId, textLength: importText.length });
        // TODO: Implement actual import logic
        // For now, just log the text
        logger.debug('Import text content:', { text: importText });
        
        // Here you would typically call an API to process the import
        // and then refresh the students list
    };

    logger.debug(`Rendering students tab for course ${courseId} with ${students.length} students`);

    if (students.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Zatím nejsou přihlášení žádní studenti.</p>
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Importovat studenty
                </button>
                <ImportStudentsModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImport}
                />
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Importovat studenty
                </button>
            </div>
            
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Číslo
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jméno
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Příjmení
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uživatelské jméno
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Studijní program
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Forma studia
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akce
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                        <tr key={student.number} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.surname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.userName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.studyProgram}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.studyForm}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-800">
                                    Detail
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <ImportStudentsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
        </>
    );
}
