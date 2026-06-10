<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:make-admin',
    description: 'Grants ROLE_ADMIN to a user identified by email',
)]
class MakeAdminCommand extends Command
{
    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email of the user to promote');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io    = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');

        $user = $this->userRepo->findOneBy(['email' => $email]);
        if (!$user) {
            $io->error(sprintf('No user found with email "%s".', $email));
            return Command::FAILURE;
        }

        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            $io->warning(sprintf('User "%s" is already an admin.', $email));
            return Command::SUCCESS;
        }

        $roles   = $user->getRoles();
        $roles[] = 'ROLE_ADMIN';
        $user->setRoles(array_unique($roles));
        $this->em->flush();

        $io->success(sprintf('User "%s" has been granted ROLE_ADMIN.', $email));
        return Command::SUCCESS;
    }
}
