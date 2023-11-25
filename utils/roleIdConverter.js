export default function roleIdConverter (id) {
    switch (id) {
        case 1:
            return 'admin';
        case 2:
            return 'user';
        default:
            return 'user';
    }
}