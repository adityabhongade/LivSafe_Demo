import { useState, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, UserPlus, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export interface Doctor {
  id: string;
  displayId: string;
  fullName: string;
  email?: string;
  specialty: string;
  patientCount: number;
  joinedDate: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  onRemoveDoctor: (doctorId: string) => void;
  onAddDoctor: (doctorData: any) => void;
}

const addDoctorSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2, "Full name is required"),
  specialty: z.string().min(2, "Specialty is required"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export function DoctorList({ doctors, onRemoveDoctor, onAddDoctor }: DoctorListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const form = useForm<z.infer<typeof addDoctorSchema>>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      email: '',
      fullName: '',
      specialty: '',
      password: ''
    }
  });

  const onSubmit = (data: z.infer<typeof addDoctorSchema>) => {
    onAddDoctor(data);
    form.reset();
    setAddDialogOpen(false);
  };

  // Filter doctors based on search term and specialty
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.displayId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, specialtyFilter]);

  // Get unique specialties for filter dropdown
  const uniqueSpecialties = useMemo(() => {
    const specialties = doctors.map(doctor => doctor.specialty);
    return [...new Set(specialties)].sort();
  }, [doctors]);

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter('all');
  };

  return (
    <div className="bg-primary-700 rounded-xl border border-primary-600 shadow-lg">
      {/* Header Section */}
      <div className="p-6 border-b border-primary-500 bg-primary-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Doctors</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <UserPlus className="mr-2 h-4 w-4" /> Add Doctor
              </Button>
            </DialogTrigger>
            
            <DialogContent className="bg-primary-800 border-primary-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Doctor</DialogTitle>
                <DialogDescription className="text-primary-300">
                  Fill in the details to add a new doctor to your organization.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dr. John Doe"
                            className="bg-white border-primary-600 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="doctor@hospital.com"
                            className="bg-white border-primary-600 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Specialty</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Radiology"
                            className="bg-white border-primary-600 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            className="bg-white border-primary-600 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                      className="border-primary-600 text-primary-100"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-accent hover:bg-accent/90">
                      Add Doctor
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
            <Input
              placeholder="Search doctors by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-primary-600 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-48 bg-white border-primary-600 text-black focus:ring-2 focus:ring-accent">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-primary-600">
                <SelectItem value="all">All Specialties</SelectItem>
                {uniqueSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || specialtyFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-primary-600 text-primary-100 hover:bg-primary-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-primary-300">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-500">
          <thead className="bg-primary-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Specialty</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Patients</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-primary-700 divide-y divide-primary-600">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-primary-600 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{doctor.displayId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{doctor.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-100">{doctor.specialty}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{doctor.patientCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-100">{doctor.joinedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-red-400 hover:text-red-300 transition-all duration-150 hover:scale-110 p-1 rounded">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-primary-800 border-primary-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remove Doctor</AlertDialogTitle>
                          <AlertDialogDescription className="text-primary-300">
                            Are you sure you want to remove {doctor.fullName} from your organization? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-primary-700 border-primary-600 text-primary-100">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => onRemoveDoctor(doctor.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="text-primary-200 text-lg font-medium">
                    {doctors.length === 0 ? 'No doctors found' : 'No doctors match your search'}
                  </div>
                  <div className="text-primary-400 text-sm mt-1">
                    {doctors.length === 0 
                      ? 'Add doctors to your organization to get started'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
