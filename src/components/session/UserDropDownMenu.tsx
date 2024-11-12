import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';

export default async function UserDropdownMenu() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={session?.user?.image ? session.user.image : ''} />
            <AvatarFallback>
              {session.user?.name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <span>Hola {session?.user?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>Email: {session?.user?.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button type="submit" className="flex items-center w-full">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
